const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, REST, Routes } = require('discord.js');

// 🎯 CONFIGURAÇÕES
const config = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    seuId: process.env.SEU_ID_DISCORD,
    seuPix: '783e54d9-a017-47ba-8046-c04ef885f04b'
};

console.log('🚀 Iniciando Bot...');

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
    console.log(`✅ ${client.user.tag} conectado!`);
    console.log(`📊 ${Object.keys(kits).length} kits carregados`);
});

// 🎪 COMANDO PRINCIPAL
client.on('interactionCreate', async (interaction) => {
    // 🛒 COMANDO /COMPRAR
    if (interaction.isCommand() && interaction.commandName === 'comprar') {
        try {
            const kitsList = Object.values(kits).map(kit => 
                `• ${kit.nome} - R$ ${kit.preco.toFixed(2)}`
            ).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('🏪 **LOJA DE KITS**')
                .setDescription('Clique no botão abaixo para comprar:')
                .addFields({ 
                    name: '📦 **KITS DISPONÍVEIS**', 
                    value: kitsList 
                })
                .setColor(0x00FF00);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('comprar_agora')
                    .setLabel('🛒 Comprar Agora')
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Erro no /comprar:', error);
        }
    }

    // 🛒 BOTÃO COMPRAR
    else if (interaction.isButton() && interaction.customId === 'comprar_agora') {
        try {
            const modal = new ModalBuilder()
                .setCustomId('formulario_compra')
                .setTitle('📝 Dados do Pedido');

            const kitInput = new TextInputBuilder()
                .setCustomId('kit')
                .setLabel('🎁 Qual kit você deseja?')
                .setPlaceholder('Ex: Kit Básico, Kit Boss, Kit Duo')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const tagInput = new TextInputBuilder()
                .setCustomId('tag')
                .setLabel('👤 Sua Tag do Discord')
                .setPlaceholder('Ex: jogador#1234')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(kitInput);
            const row2 = new ActionRowBuilder().addComponents(tagInput);
            
            modal.addComponents(row1, row2);
            await interaction.showModal(modal);

        } catch (error) {
            console.error('Erro no modal:', error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: '❌ Erro. Tente novamente.', 
                    ephemeral: true 
                });
            }
        }
    }

    // 📝 PROCESSAR PEDIDO
    else if (interaction.isModalSubmit() && interaction.customId === 'formulario_compra') {
        try {
            const kitNome = interaction.fields.getTextInputValue('kit');
            const discordTag = interaction.fields.getTextInputValue('tag');

            // BUSCA SIMPLES E EFETIVA
            const kitEncontrado = Object.values(kits).find(kit => 
                kit.nome.toLowerCase().includes(kitNome.toLowerCase()) ||
                kitNome.toLowerCase().includes(kit.nome.toLowerCase())
            );

            if (!kitEncontrado) {
                const kitsDisponiveis = Object.values(kits)
                    .map(kit => `• ${kit.nome}`)
                    .join('\n');
                
                await interaction.reply({
                    content: `❌ **"${kitNome}" não encontrado!**\n\n📋 **Kits disponíveis:**\n${kitsDisponiveis}`,
                    ephemeral: true
                });
                return;
            }

            // SALVAR PEDIDO
            pedidosTemp.set(interaction.user.id, {
                kit: kitEncontrado.nome,
                preco: kitEncontrado.preco,
                discordTag: discordTag
            });

            // BOTÃO CONFIRMAR
            const confirmButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirmar_pedido')
                    .setLabel(`✅ Confirmar - R$ ${kitEncontrado.preco.toFixed(2)}`)
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.reply({
                content: `📋 **RESUMO DO PEDIDO:**\n\n🎁 **Kit:** ${kitEncontrado.nome}\n💵 **Preço:** R$ ${kitEncontrado.preco.toFixed(2)}\n👤 **Sua Tag:** ${discordTag}\n\n**Clique em confirmar:**`,
                components: [confirmButton],
                ephemeral: true
            });

        } catch (error) {
            console.error('Erro ao processar:', error);
            await interaction.reply({ 
                content: '❌ Erro no pedido.', 
                ephemeral: true 
            });
        }
    }

    // 💳 CONFIRMAR PEDIDO
    else if (interaction.isButton() && interaction.customId === 'confirmar_pedido') {
        try {
            const pedido = pedidosTemp.get(interaction.user.id);
            
            if (!pedido) {
                await interaction.reply({ 
                    content: '❌ Pedido não encontrado.', 
                    ephemeral: true 
                });
                return;
            }

            // 1. ENVIAR PIX PARA O CLIENTE
            const user = await client.users.fetch(interaction.user.id);
            
            await user.send({
                content: `💰 **PAGAMENTO PIX - ${pedido.kit}**\n\n🔑 **CHAVE PIX:** \`${config.seuPix}\`\n💵 **VALOR:** R$ ${pedido.preco.toFixed(2)}\n\n📱 **CLIQUE E SEGURE NO PIX PARA COPIAR!**`
            });

            // 2. BOTÃO PARA ENTREGA
            const entregaButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('dados_entrega')
                    .setLabel('📋 Dados de Entrega')
                    .setStyle(ButtonStyle.Primary)
            );

            await user.send({ 
                content: '**📦 PREENCHA OS DADOS DE ENTREGA:**\n\nClique no botão abaixo para informar onde receber seu kit!', 
                components: [entregaButton] 
            });

            // 3. NOTIFICAR VENDEDOR
            try {
                const adminUser = await client.users.fetch(config.seuId);
                await adminUser.send({
                    content: `🛒 **NOVO PEDIDO!**\n\n**Cliente:** ${interaction.user.tag}\n**Kit:** ${pedido.kit}\n**Valor:** R$ ${pedido.preco.toFixed(2)}\n**Tag:** ${pedido.discordTag}`
                });
            } catch (adminError) {
                console.log('Erro ao notificar:', adminError);
            }

            // 4. CONFIRMAÇÃO
            await interaction.update({ 
                content: '✅ **COMPRA CONFIRMADA!**\n\n💬 **Verifique suas MENSAGENS PRIVADAS!**\n\nLá você encontrará:\n• 🔑 PIX para pagamento\n• 📋 Formulário de entrega', 
                components: [] 
            });

        } catch (error) {
            console.error('Erro ao confirmar:', error);
            await interaction.reply({ 
                content: '❌ Erro no pagamento.', 
                ephemeral: true 
            });
        }
    }

    // 📋 DADOS DE ENTREGA
    else if (interaction.isButton() && interaction.customId === 'dados_entrega') {
        try {
            const modal = new ModalBuilder()
                .setCustomId('formulario_entrega')
                .setTitle('🚚 Dados de Entrega');

            const coordenadasInput = new TextInputBuilder()
                .setCustomId('coordenadas')
                .setLabel('📍 Coordenadas (X, Y, Z)')
                .setPlaceholder('Ex: X: 100, Y: 64, Z: -200')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const nickInput = new TextInputBuilder()
                .setCustomId('nick')
                .setLabel('🎮 Seu Nick no Minecraft')
                .setPlaceholder('Ex: Player123')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(coordenadasInput);
            const row2 = new ActionRowBuilder().addComponents(nickInput);
            
            modal.addComponents(row1, row2);
            await interaction.showModal(modal);

        } catch (error) {
            console.error('Erro no formulário:', error);
        }
    }

    // ✅ FINALIZAR ENTREGA
    else if (interaction.isModalSubmit() && interaction.customId === 'formulario_entrega') {
        try {
            const coordenadas = interaction.fields.getTextInputValue('coordenadas');
            const nickMinecraft = interaction.fields.getTextInputValue('nick');
            const pedido = pedidosTemp.get(interaction.user.id);

            // CONFIRMAR PARA CLIENTE
            await interaction.reply({ 
                content: `✅ **DADOS SALVOS!**\n\n📍 **Coordenadas:** ${coordenadas}\n🎮 **Nick:** ${nickMinecraft}\n\n📸 **Agora envie o comprovante do PIX!**`, 
                ephemeral: true 
            });

            // NOTIFICAR VENDEDOR
            try {
                const adminUser = await client.users.fetch(config.seuId);
                await adminUser.send({
                    content: `🚚 **DADOS DE ENTREGA!**\n\n**Cliente:** ${interaction.user.tag}\n**Kit:** ${pedido.kit}\n**Valor:** R$ ${pedido.preco.toFixed(2)}\n**Coordenadas:** ${coordenadas}\n**Nick:** ${nickMinecraft}`
                });
                
                pedidosTemp.delete(interaction.user.id);
            } catch (adminError) {
                console.log('Erro ao enviar dados:', adminError);
            }

        } catch (error) {
            console.error('Erro na entrega:', error);
            await interaction.reply({ 
                content: '❌ Erro ao salvar.', 
                ephemeral: true 
            });
        }
    }
});

// 🔧 REGISTRAR COMANDO
client.once('ready', async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(config.token);
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: [{ name: 'comprar', description: 'Comprar kits' }] }
        );
        console.log('✅ Comando registrado!');
    } catch (error) {
        console.error('❌ Erro:', error);
    }
});

client.login(config.token);
