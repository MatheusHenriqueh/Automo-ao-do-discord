const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, REST, Routes } = require('discord.js');

// CONFIGURAÇÕES
const config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  seuId: process.env.SEU_ID_DISCORD,
  seuPix: '783e54d9-a017-47ba-8046-c04ef885f04b'
};

console.log('🔄 Iniciando bot no Railway...');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ]
});

// 📦 SEUS KITS ATUALIZADOS
const kits = {
  'kit_basico': { nome: 'Kit Básico', preco: 4.50 },
  'kit_basico_netherita': { nome: 'Kit Básico Netherita', preco: 7.50 },
  'kit_dima': { nome: 'Kit Dima', preco: 9.00 },
  'kit_dima_2': { nome: 'Kit Dima 2', preco: 6.00 },
  'kit_boss': { nome: 'Kit Boss', preco: 13.00 },
  'kit_boss_2': { nome: 'Kit Boss 2', preco: 20.00 },
  'kit_boss_evo': { nome: 'Kit Boss Evo', preco: 19.00 },
  'kit_da_besta_1': { nome: 'Kit da Besta 1', preco: 25.00 },
  'kit_da_besta_2': { nome: 'Kit da Besta 2', preco: 20.00 },
  'kit_netherita_evo': { nome: 'Kit Netherita Evo', preco: 19.00 },
  'kit_gardian': { nome: 'Kit Gardian', preco: 26.00 },
  'kit_pocao': { nome: 'Kit Poção', preco: 10.00 },
  'kit_duo': { nome: 'Kit Duo', preco: 30.00 }
};

const pedidosTemp = new Map();

client.once('ready', () => {
  console.log('✅ Bot conectado como ' + client.user.tag);
});

// COMANDO /comprar
client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand() && interaction.commandName === 'comprar') {
    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('iniciar_compra')
          .setLabel('🛒 Comprar')
          .setStyle(ButtonStyle.Success)
      );

    // Lista organizada dos kits
    const kitsList = Object.values(kits).map(kit => 
      `• ${kit.nome} - R$ ${kit.preco.toFixed(2)}`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🛒 **LOJA DE KITS**')
      .setDescription('Clique no botão abaixo para iniciar sua compra!')
      .addFields({ 
        name: '📦 **KITS DISPONÍVEIS**', 
        value: kitsList 
      })
      .setColor(0x00FF00)
      .setFooter({ text: 'Escolha seu kit e faça o pedido!' });

    await interaction.reply({ 
      embeds: [embed], 
      components: [button] 
    });
  }
  
  // BOTÃO COMPRAR CLICADO
  else if (interaction.isButton() && interaction.customId === 'iniciar_compra') {
    const modal = new ModalBuilder()
      .setCustomId('compra_modal')
      .setTitle('📝 Dados do Pedido');

    const kitInput = new TextInputBuilder()
      .setCustomId('kit')
      .setLabel('🎁 Qual kit você deseja?')
      .setPlaceholder('Ex: Kit Básico, Kit Boss, Kit Duo...')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const tagInput = new TextInputBuilder()
      .setCustomId('tag')
      .setLabel('👤 Sua Tag do Discord')
      .setPlaceholder('seunome#1234')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(kitInput),
      new ActionRowBuilder().addComponents(tagInput)
    );

    await interaction.showModal(modal);
  }
  
  // MODAL PREENCHIDO
  else if (interaction.isModalSubmit() && interaction.customId === 'compra_modal') {
    const kitEscolhido = interaction.fields.getTextInputValue('kit');
    const discordTag = interaction.fields.getTextInputValue('tag');

    // Encontrar o kit (busca mais flexível)
    const kitKey = Object.keys(kits).find(key => {
      const kitNome = kits[key].nome.toLowerCase();
      const busca = kitEscolhido.toLowerCase();
      return kitNome.includes(busca) || busca.includes(kitNome);
    });

    if (!kitKey) {
      // Sugerir kits similares
      const sugestoes = Object.values(kits)
        .filter(kit => kit.nome.toLowerCase().includes(kitEscolhido.toLowerCase().split(' ')[0]))
        .slice(0, 3)
        .map(kit => `• ${kit.nome}`)
        .join('\n');
      
      const mensagemErro = sugestoes 
        ? `❌ **Kit não encontrado!**\n\n💡 **Sugestões:**\n${sugestoes}`
        : '❌ **Kit não encontrado!** Verifique o nome do kit.';
      
      await interaction.reply({
        content: mensagemErro,
        ephemeral: true
      });
      return;
    }

    const kit = kits[kitKey];
    
    // Salvar pedido temporário
    pedidosTemp.set(interaction.user.id, {
      kit: kit.nome,
      preco: kit.preco,
      discordTag: discordTag
    });

    // BOTÃO CONFIRMAR
    const confirmButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirmar_compra')
          .setLabel(`✅ Confirmar - R$ ${kit.preco.toFixed(2)}`)
          .setStyle(ButtonStyle.Success)
      );

    const resumoEmbed = new EmbedBuilder()
      .setTitle('💰 **RESUMO DO PEDIDO**')
      .setDescription('Confirme seus dados abaixo:')
      .addFields(
        { name: '🎁 **Kit Escolhido**', value: kit.nome, inline: true },
        { name: '💵 **Preço**', value: `R$ ${kit.preco.toFixed(2)}`, inline: true },
        { name: '👤 **Sua Tag**', value: discordTag, inline: false },
        { name: '🔒 **Próximo Passo**', value: 'Ao confirmar, abriremos um chat privado para finalizar!', inline: false }
      )
      .setColor(0xF1C40F);

    await interaction.reply({
      embeds: [resumoEmbed],
      components: [confirmButton],
      ephemeral: true
    });
  }
  
  // CONFIRMAR COMPRA
  else if (interaction.isButton() && interaction.customId === 'confirmar_compra') {
    const pedido = pedidosTemp.get(interaction.user.id);
    
    if (!pedido) {
      await interaction.reply({
        content: '❌ Pedido não encontrado! Comece novamente com /comprar',
        ephemeral: true
      });
      return;
    }

    try {
      // ENVIAR PIX PARA O COMPRADOR
      const user = await client.users.fetch(interaction.user.id);
      
      const pixEmbed = new EmbedBuilder()
        .setTitle('💰 **PAGAMENTO PIX**')
        .setDescription('**Use os dados abaixo para pagamento:**')
        .addFields(
          { name: '🔑 **CHAVE PIX**', value: `\`${config.seuPix}\``, inline: false },
          { name: '💵 **VALOR EXATO**', value: `**R$ ${pedido.preco.toFixed(2)}**`, inline: true },
          { name: '📱 **PARA MOBILE**', value: '**Clique e segure no PIX acima para copiar!**', inline: false }
        )
        .setColor(0x27AE60);

      await user.send({
        content: `🛒 **PEDIDO CONFIRMADO!**\n\n**🎁 Kit:** ${pedido.kit}\n**💵 Valor:** R$ ${pedido.preco.toFixed(2)}\n**👤 Sua Tag:** ${pedido.discordTag}\n\n**📱 CLIQUE E SEGURE NO PIX PARA COPIAR FACILMENTE!**`,
        embeds: [pixEmbed]
      });

      // BOTÃO PARA PREENCHER DADOS DE ENTREGA
      const entregaButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('preencher_entrega')
            .setLabel('📋 Preencher Dados de Entrega')
            .setStyle(ButtonStyle.Primary)
        );

      await user.send({
        content: '**📦 AGORA PREENCHA SEUS DADOS PARA ENTREGA:**\n\n📍 **Coordenadas** - Onde quer receber o kit\n🎮 **Nick Minecraft** - Seu nome no jogo',
        components: [entregaButton]
      });

      // NOTIFICAR ADMIN (VOCÊ)
      try {
        const adminUser = await client.users.fetch(config.seuId);
        const adminEmbed = new EmbedBuilder()
          .setTitle('🛒 **🔥 NOVO PEDIDO!**')
          .setDescription(`**Comprador:** ${interaction.user.tag}\n**ID:** ${interaction.user.id}`)
          .addFields(
            { name: '🎁 **Kit**', value: pedido.kit, inline: true },
            { name: '💵 **Valor**', value: `R$ ${pedido.preco.toFixed(2)}`, inline: true },
            { name: '👤 **Tag Discord**', value: pedido.discordTag, inline: true },
            { name: '📞 **Contato**', value: `[Clique para falar](https://discord.com/users/${interaction.user.id})`, inline: false }
          )
          .setColor(0xFF0000)
          .setTimestamp();

        await adminUser.send({ 
          content: `🔔 **NOVO PEDIDO RECEBIDO!**`,
          embeds: [adminEmbed] 
        });
        
      } catch (adminError) {
        console.log('❌ Erro ao notificar admin:', adminError);
      }

      await interaction.reply({
        content: '✅ **COMPRA CONFIRMADA!**\n\n💬 **Verifique sua MENSAGEM PRIVADA comigo para:**\n• 🔑 Copiar o PIX (clique e segure)\n• 📸 Enviar comprovante\n• 📋 Preencher dados de entrega\n\n📱 **Aguardamos seu pagamento!**',
        ephemeral: true
      });

    } catch (error) {
      console.log('❌ Erro:', error);
      await interaction.reply({
        content: '❌ **Erro ao abrir chat privado!**\n\n⚠️ **Verifique se você aceita mensagens de membros do servidor.**',
        ephemeral: true
      });
    }
  }
  
  // BOTÃO PARA PREENCHER ENTREGA
  else if (interaction.isButton() && interaction.customId === 'preencher_entrega') {
    const deliveryModal = new ModalBuilder()
      .setCustomId('dados_entrega')
      .setTitle('🚚 Dados para Entrega');

    const coordenadasInput = new TextInputBuilder()
      .setCustomId('coordenadas')
      .setLabel('📍 Coordenadas para Entrega')
      .setPlaceholder('Ex: X: 100, Y: 64, Z: -200')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const nickInput = new TextInputBuilder()
      .setCustomId('nick')
      .setLabel('🎮 Seu Nick no Minecraft')
      .setPlaceholder('Ex: Player123')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(coordenadasInput),
      new ActionRowBuilder().addComponents(nickInput)
    );

    await interaction.showModal(modal);
  }
  
  // DADOS ENTREGA PREENCHIDOS
  else if (interaction.isModalSubmit() && interaction.customId === 'dados_entrega') {
    const coordenadas = interaction.fields.getTextInputValue('coordenadas');
    const nickMinecraft = interaction.fields.getTextInputValue('nick');
    const pedido = pedidosTemp.get(interaction.user.id);

    // Confirmar para o comprador
    const confirmEmbed = new EmbedBuilder()
      .setTitle('✅ **DADOS SALVOS COM SUCESSO!**')
      .setDescription('Seus dados de entrega foram registrados!')
      .addFields(
        { name: '📍 **Coordenadas**', value: coordenadas, inline: false },
        { name: '🎮 **Nick Minecraft**', value: nickMinecraft, inline: true },
        { name: '📞 **Próximo Passo**', value: 'Agora envie o comprovante do PIX e aguarde a confirmação!', inline: false }
      )
      .setColor(0x27AE60);

    await interaction.reply({
      content: '📋 **DADOS REGISTRADOS!**',
      embeds: [confirmEmbed]
    });

    // Notificar admin (você) com todos os dados
    try {
      const adminUser = await client.users.fetch(config.seuId);
      const adminEmbed = new EmbedBuilder()
        .setTitle('🚚 **DADOS DE ENTREGA RECEBIDOS**')
        .setDescription(`**Comprador:** ${interaction.user.tag}`)
        .addFields(
          { name: '🎁 **Kit**', value: pedido.kit, inline: true },
          { name: '💵 **Valor**', value: `R$ ${pedido.preco.toFixed(2)}`, inline: true },
          { name: '📍 **Coordenadas**', value: coordenadas, inline: false },
          { name: '🎮 **Nick Minecraft**', value: nickMinecraft, inline: true },
          { name: '👤 **Tag Discord**', value: pedido.discordTag, inline: true }
        )
        .setColor(0x3498DB)
        .setTimestamp();

      await adminUser.send({ 
        content: `📦 **DADOS DE ENTREGA RECEBIDOS!**`,
        embeds: [adminEmbed] 
      });
      
      // Limpar pedido temporário
      pedidosTemp.delete(interaction.user.id);
      
    } catch (adminError) {
      console.log('❌ Erro ao notificar admin:', adminError);
    }
  }
});

// REGISTRAR COMANDO
client.once('ready', async () => {
  try {
    const rest = new REST({ version: '10' }).setToken(config.token);
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: [{ name: 'comprar', description: 'Comprar kits' }] }
    );
    console.log('✅ Comando /comprar registrado!');
  } catch (error) {
    console.error('❌ Erro ao registrar comando:', error);
  }
});

client.login(config.token);