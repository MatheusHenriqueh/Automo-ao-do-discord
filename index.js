const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, REST, Routes } = require('discord.js');

// 🎯 CONFIGURAÇÕES PROFISSIONAIS
const config = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    seuId: process.env.SEU_ID_DISCORD,
    seuPix: '783e54d9-a017-47ba-8046-c04ef885f04b'
};

// 🎨 CORES PARA EMBEDS
const colors = {
    primary: 0x00AE86,    // Verde principal
    success: 0x27AE60,    // Verde sucesso
    warning: 0xF39C12,    // Laranja alerta
    error: 0xE74C3C,      // Vermelho erro
    info: 0x3498DB,       // Azul informação
    premium: 0x9B59B6     // Roxo premium
};

console.log('🚀 Iniciando Bot Profissional...');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

// 📦 SEUS KITS ATUALIZADOS - PREÇOS CORRETOS
const kits = {
    'kit_basico': { nome: '🌟 Kit Básico', preco: 4.50 },
    'kit_basico_netherita': { nome: '⚔️ Kit Básico Netherita', preco: 7.50 },
    'kit_dima': { nome: '💎 Kit Dima', preco: 9.00 },
    'kit_dima_2': { nome: '💎 Kit Dima 2', preco: 6.00 },
    'kit_boss': { nome: '👑 Kit Boss', preco: 13.00 },
    'kit_boss_2': { nome: '👑 Kit Boss 2', preco: 20.00 },
    'kit_boss_evo': { nome: '🔥 Kit Boss Evo', preco: 19.00 },
    'kit_da_besta_1': { nome: '🐲 Kit da Besta 1', preco: 25.00 },
    'kit_da_besta_2': { nome: '🐲 Kit da Besta 2', preco: 20.00 },
    'kit_netherita_evo': { nome: '🔥 Kit Netherita Evo', preco: 19.00 },
    'kit_gardian': { nome: '🛡️ Kit Gardian', preco: 26.00 },
    'kit_pocao': { nome: '🧪 Kit Poção', preco: 10.00 },
    'kit_duo': { nome: '👥 Kit Duo', preco: 30.00 }
};

const pedidosTemp = new Map();

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} conectado e pronto!`);
    console.log(`📊 ${Object.keys(kits).length} kits carregados`);
});

// 🎪 COMANDO PRINCIPAL - LOJA
client.on('interactionCreate', async (interaction) => {
    // 🛒 COMANDO /COMPRAR
    if (interaction.isCommand() && interaction.commandName === 'comprar') {
        try {
            // Organizar kits por preço
            const kitsBasicos = Object.values(kits).filter(kit => kit.preco <= 10);
            const kitsIntermediarios = Object.values(kits).filter(kit => kit.preco > 10 && kit.preco <= 20);
            const kitsAvancados = Object.values(kits).filter(kit => kit.preco > 20);

            const embed = new EmbedBuilder()
                .setTitle('🏪 **LOJA DE KITS - PREÇOS ATUALIZADOS**')
                .setDescription('🎯 **Todos os kits com preços especiais!**\nSelecione o kit desejado:')
                .setColor(colors.primary)
                .addFields(
                    { 
                        name: '🎯 **KITS BÁSICOS**', 
                        value: kitsBasicos.map(kit => `• ${kit.nome} - **R$ ${kit.preco.toFixed(2)}**`).join('\n'),
                        inline: false 
                    },
                    { 
                        name: '⚡ **KITS INTERMEDIÁRIOS**', 
                        value: kitsIntermediarios.map(kit => `• ${kit.nome} - **R$ ${kit.preco.toFixed(2)}**`).join('\n'),
                        inline: false 
                    },
                    { 
                        name: '👑 **KITS AVANÇADOS**', 
                        value: kitsAvancados.map(kit => `• ${kit.nome} - **R$ ${kit.preco.toFixed(2)}**`).join('\n'),
                        inline: false 
                    }
                )
                .setFooter({ text: 'Clique em "Comprar Agora" para continuar' })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('iniciar_compra')
                    .setLabel('🛒 Comprar Agora')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💰')
            );

            await interaction.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('❌ Erro no comando /comprar:', error);
            await interaction.reply({ content: '❌ Erro ao carregar loja.', ephemeral: true });
        }
    }

    // 🛒 INICIAR COMPRA
    else if (interaction.isButton() && interaction.customId === 'iniciar_compra') {
        try {
            const modal = new ModalBuilder()
                .setCustomId('dados_compra')
                .setTitle('📝 Dados da Compra');

            const kitInput = new TextInputBuilder()
                .setCustomId('kit_escolhido')
                .setLabel('🎁 Nome do Kit Desejado')
                .setPlaceholder('Ex: Kit Básico, Kit Boss, Kit Duo...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(50);

            const tagInput = new TextInputBuilder()
                .setCustomId('discord_tag')
                .setLabel('👤 Sua Tag do Discord')
                .setPlaceholder('Ex: jogador#1234')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(40);

            const row1 = new ActionRowBuilder().addComponents(kitInput);
            const row2 = new ActionRowBuilder().addComponents(tagInput);
            
            modal.addComponents(row1, row2);
            await interaction.showModal(modal);

        } catch (error) {
            console.error('❌ Erro ao mostrar modal:', error);
        }
    }

    // 📝 PROCESSAR DADOS DA COMPRA
    else if (interaction.isModalSubmit() && interaction.customId === 'dados_compra') {
        try {
            const kitNome = interaction.fields.getTextInputValue('kit_escolhido');
            const discordTag = interaction.fields.getTextInputValue('discord_tag');

            console.log(`🔍 Buscando kit: "${kitNome}" para ${interaction.user.tag}`);

            // Busca inteligente
            const kitEncontrado = Object.values(kits).find(kit => 
                kit.nome.toLowerCase().includes(kitNome.toLowerCase()) ||
                kitNome.toLowerCase().includes(kit.nome.toLowerCase())
            );

            if (!kitEncontrado) {
                const todosKits = Object.values(kits)
                    .map(kit => `• ${kit.nome} - R$ ${kit.preco.toFixed(2)}`)
                    .join('\n');

                const embed = new EmbedBuilder()
                    .setTitle('❌ Kit Não Encontrado')
                    .setDescription(`**"${kitNome}"** não foi encontrado.`)
                    .setColor(colors.error)
                    .addFields({
                        name: '📋 **Todos os Kits Disponíveis:**',
                        value: todosKits
                    })
                    .setFooter({ text: 'Digite o nome exato do kit' });

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // Salvar pedido temporário
            pedidosTemp.set(interaction.user.id, {
                kit: kitEncontrado.nome,
                preco: kitEncontrado.preco,
                discordTag: discordTag
            });

            // Embed de confirmação
            const embed = new EmbedBuilder()
                .setTitle('✅ **PEDIDO CONFIRMADO**')
                .setDescription('Revise seus dados antes de finalizar:')
                .setColor(colors.success)
                .addFields(
                    { name: '🎁 **Kit Selecionado**', value: kitEncontrado.nome, inline: true },
                    { name: '💰 **Valor Total**', value: `R$ ${kitEncontrado.preco.toFixed(2)}`, inline: true },
                    { name: '👤 **Dados do Comprador**', value: `Tag: ${discordTag}`, inline: false }
                )
                .setFooter({ text: 'Clique em "Finalizar Compra" para prosseguir' })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('finalizar_compra')
                    .setLabel(`💳 Finalizar - R$ ${kitEncontrado.preco.toFixed(2)}`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        } catch (error) {
            console.error('❌ Erro ao processar pedido:', error);
            await interaction.reply({ 
                content: '❌ Erro ao processar seu pedido.', 
                ephemeral: true 
            });
        }
    }

    // 💳 FINALIZAR COMPRA
    else if (interaction.isButton() && interaction.customId === 'finalizar_compra') {
        try {
            const pedido = pedidosTemp.get(interaction.user.id);
            
            if (!pedido) {
                await interaction.reply({ 
                    content: '❌ Pedido não encontrado.', 
                    ephemeral: true 
                });
                return;
            }

            // 1. ENVIAR DETALHES DO PEDIDO PARA O CLIENTE
            const user = await client.users.fetch(interaction.user.id);
            
            const embedPagamento = new EmbedBuilder()
                .setTitle('💰 **PAGAMENTO VIA PIX**')
                .setDescription('**Siga os passos abaixo para finalizar:**')
                .setColor(colors.info)
                .addFields(
                    { name: '🎁 **Seu Pedido**', value: pedido.kit, inline: true },
                    { name: '💵 **Valor**', value: `R$ ${pedido.preco.toFixed(2)}`, inline: true },
                    { name: '🔑 **CHAVE PIX**', value: `\`${config.seuPix}\``, inline: false },
                    { name: '📱 **Como Pagar**', value: '1. Copie a chave PIX\n2. Abra seu app bancário\n3. Cole no PIX\n4. Confirme o pagamento', inline: false }
                )
                .setFooter({ text: 'Pagamento 100% seguro' });

            await user.send({ 
                content: '🛒 **SEU PEDIDO ESTÁ QUASE PRONTO!**', 
                embeds: [embedPagamento] 
            });

            // 2. SOLICITAR DADOS DE ENTREGA
            const rowEntrega = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('preencher_entrega')
                    .setLabel('📋 Preencher Dados de Entrega')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📍')
            );

            await user.send({ 
                content: '**📦 INFORME ONDE RECEBER SEU KIT:**\n\n📍 **Coordenadas** - Onde quer receber\n🎮 **Nick Minecraft** - Seu nome no jogo', 
                components: [rowEntrega] 
            });

            // 3. NOTIFICAR O VENDEDOR
            try {
                const adminUser = await client.users.fetch(config.seuId);
                
                await adminUser.send({
                    content: `🛒 **NOVO PEDIDO!**\n\n**Cliente:** ${interaction.user.tag}\n**Kit:** ${pedido.kit}\n**Valor:** R$ ${pedido.preco.toFixed(2)}\n**Tag:** ${pedido.discordTag}`
                });

            } catch (adminError) {
                console.error('❌ Erro ao notificar admin:', adminError);
            }

            // 4. CONFIRMAÇÃO FINAL
            await interaction.update({ 
                content: '✅ **COMPRA FINALIZADA!**\n\n💬 **Verifique suas MENSAGENS PRIVADAS!**\n\nLá você encontrará:\n• 🔑 PIX para pagamento\n• 📋 Formulário de entrega\n\n📱 **Aguardamos seu pagamento!**', 
                embeds: [], 
                components: [] 
            });

        } catch (error) {
            console.error('❌ Erro ao finalizar compra:', error);
            await interaction.reply({ 
                content: '❌ Erro ao processar pagamento.', 
                ephemeral: true 
            });
        }
    }

    // 📋 FORMULÁRIO DE ENTREGA
    else if (interaction.isButton() && interaction.customId === 'preencher_entrega') {
        try {
            const modal = new ModalBuilder()
                .setCustomId('formulario_entrega')
                .setTitle('🎯 Dados de Entrega');

            const coordenadasInput = new TextInputBuilder()
                .setCustomId('coordenadas')
                .setLabel('📍 Coordenadas no Minecraft')
                .setPlaceholder('Ex: X: 125, Y: 64, Z: -340')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const nickInput = new TextInputBuilder()
                .setCustomId('nick_minecraft')
                .setLabel('🎮 Seu Nick no Minecraft')
                .setPlaceholder('Ex: SuperJogador123')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(coordenadasInput);
            const row2 = new ActionRowBuilder().addComponents(nickInput);
            
            modal.addComponents(row1, row2);
            await interaction.showModal(modal);

        } catch (error) {
            console.error('❌ Erro ao mostrar formulário:', error);
        }
    }

    // ✅ DADOS DE ENTREGA CONFIRMADOS
    else if (interaction.isModalSubmit() && interaction.customId === 'formulario_entrega') {
        try {
            const coordenadas = interaction.fields.getTextInputValue('coordenadas');
            const nickMinecraft = interaction.fields.getTextInputValue('nick_minecraft');
            const pedido = pedidosTemp.get(interaction.user.id);

            if (!pedido) {
                await interaction.reply({ 
                    content: '❌ Pedido não encontrado.', 
                    ephemeral: true 
                });
                return;
            }

            // Confirmar para o cliente
            await interaction.reply({ 
                content: `✅ **DADOS SALVOS!**\n\n📍 **Coordenadas:** ${coordenadas}\n🎮 **Nick:** ${nickMinecraft}\n\n📸 **Agora envie o comprovante do PIX!**`, 
                ephemeral: true 
            });

            // Notificar o vendedor
            try {
                const adminUser = await client.users.fetch(config.seuId);
                
                await adminUser.send({
                    content: `🚚 **DADOS DE ENTREGA!**\n\n**Cliente:** ${interaction.user.tag}\n**Kit:** ${pedido.kit}\n**Valor:** R$ ${pedido.preco.toFixed(2)}\n**Coordenadas:** ${coordenadas}\n**Nick:** ${nickMinecraft}`
                });

                // Limpar pedido
                pedidosTemp.delete(interaction.user.id);

            } catch (adminError) {
                console.error('❌ Erro ao enviar dados para vendedor:', adminError);
            }

        } catch (error) {
            console.error('❌ Erro ao processar entrega:', error);
            await interaction.reply({ 
                content: '❌ Erro ao salvar dados.', 
                ephemeral: true 
            });
        }
    }
});

// 🔧 REGISTRAR COMANDOS
client.once('ready', async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(config.token);
        
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: [{ name: 'comprar', description: '🛍️ Acessar a loja de kits' }] }
        );

        console.log('✅ Comandos registrados!');

    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
});

// 🚀 INICIAR BOT
client.login(config.token);

