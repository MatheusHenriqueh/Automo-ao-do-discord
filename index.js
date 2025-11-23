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

// 📦 CATÁLOGO DE KITS PROFISSIONAL
const kits = {
    'basico': { nome: '🌟 Kit Básico', preco: 4.50, cor: colors.primary },
    'basico_netherita': { nome: '⚔️ Kit Básico Netherita', preco: 7.50, cor: colors.info },
    'dima': { nome: '💎 Kit Dima', preco: 9.00, cor: colors.info },
    'dima_2': { nome: '💎 Kit Dima 2', preco: 6.00, cor: colors.info },
    'boss': { nome: '👑 Kit Boss', preco: 13.00, cor: colors.warning },
    'boss_2': { nome: '👑 Kit Boss 2', preco: 20.00, cor: colors.warning },
    'boss_evo': { nome: '🔥 Kit Boss Evo', preco: 19.00, cor: colors.warning },
    'besta_1': { nome: '🐲 Kit da Besta 1', preco: 25.00, cor: colors.premium },
    'besta_2': { nome: '🐲 Kit da Besta 2', preco: 20.00, cor: colors.premium },
    'netherita_evo': { nome: '🔥 Kit Netherita Evo', preco: 19.00, cor: colors.premium },
    'gardian': { nome: '🛡️ Kit Gardian', preco: 26.00, cor: colors.premium },
    'pocao': { nome: '🧪 Kit Poção', preco: 10.00, cor: colors.info },
    'duo': { nome: '👥 Kit Duo', preco: 30.00, cor: colors.premium }
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
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('abrir_loja')
                    .setLabel('🛍️ Abrir Loja')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🏪')
            );

            const embed = new EmbedBuilder()
                .setTitle('🏪 **LOJA OFICIAL**')
                .setDescription('Bem-vindo à nossa loja de kits! Clique no botão abaixo para ver nossos produtos.')
                .setColor(colors.primary)
                .setThumbnail('https://cdn.discordapp.com/emojis/998805272598900766.webp')
                .addFields(
                    { name: '📦 Variedade', value: 'Kits para todos os estilos', inline: true },
                    { name: '⚡ Entrega', value: 'Rápida e segura', inline: true },
                    { name: '🛡️ Suporte', value: '24/7 disponível', inline: true }
                )
                .setFooter({ text: 'Clique em "Abrir Loja" para continuar' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('❌ Erro no comando /comprar:', error);
            await interaction.reply({ content: '❌ Erro ao carregar loja.', ephemeral: true });
        }
    }

    // 🏪 BOTÃO ABRIR LOJA
    else if (interaction.isButton() && interaction.customId === 'abrir_loja') {
        try {
            // Organizar kits por categoria
            const kitsBasicos = Object.values(kits).filter(kit => kit.preco <= 10);
            const kitsIntermediarios = Object.values(kits).filter(kit => kit.preco > 10 && kit.preco <= 20);
            const kitsAvancados = Object.values(kits).filter(kit => kit.preco > 20);

            const embed = new EmbedBuilder()
                .setTitle('📦 **CATÁLOGO DE KITS**')
                .setDescription('Selecione o kit desejado abaixo:')
                .setColor(colors.primary)
                .setThumbnail('https://cdn.discordapp.com/emojis/1128724551988940911.webp')
                .addFields(
                    { 
                        name: '🎯 **KITS BÁSICOS**', 
                        value: kitsBasicos.map(kit => `• ${kit.nome} - **R$ ${kit.preco.toFixed(2)}**`).join('\n') || '• Nenhum kit disponível',
                        inline: false 
                    },
                    { 
                        name: '⚡ **KITS INTERMEDIÁRIOS**', 
                        value: kitsIntermediarios.map(kit => `• ${kit.nome} - **R$ ${kit.preco.toFixed(2)}**`).join('\n') || '• Nenhum kit disponível',
                        inline: false 
                    },
                    { 
                        name: '👑 **KITS AVANÇADOS**', 
                        value: kitsAvancados.map(kit => `• ${kit.nome} - **R$ ${kit.preco.toFixed(2)}**`).join('\n') || '• Nenhum kit disponível',
                        inline: false 
                    }
                )
                .setFooter({ text: 'Digite o nome exato do kit que deseja' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('iniciar_compra')
                    .setLabel('🛒 Comprar Agora')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💰')
            );

            await interaction.update({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('❌ Erro ao abrir loja:', error);
            await interaction.reply({ content: '❌ Erro ao carregar catálogo.', ephemeral: true });
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
                .setPlaceholder('Ex: Kit Boss, Kit Duo, Kit Básico...')
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

            // Busca inteligente com tolerância a erros
            const kitEncontrado = Object.values(kits).find(kit => 
                kit.nome.toLowerCase().replace(/[^a-z0-9]/g, '')
                    .includes(kitNome.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
                kitNome.toLowerCase().replace(/[^a-z0-9]/g, '')
                    .includes(kit.nome.toLowerCase().replace(/[^a-z0-9]/g, ''))
            );

            if (!kitEncontrado) {
                const sugestoes = Object.values(kits)
                    .slice(0, 5)
                    .map(kit => `• ${kit.nome} - R$ ${kit.preco.toFixed(2)}`)
                    .join('\n');

                const embed = new EmbedBuilder()
                    .setTitle('❌ Kit Não Encontrado')
                    .setDescription(`**"${kitNome}"** não foi encontrado em nossa loja.`)
                    .setColor(colors.error)
                    .addFields({
                        name: '💡 Kits Disponíveis:',
                        value: sugestoes
                    })
                    .setFooter({ text: 'Digite o nome exato do kit' });

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // Salvar pedido temporário
            pedidosTemp.set(interaction.user.id, {
                kit: kitEncontrado.nome,
                preco: kitEncontrado.preco,
                discordTag: discordTag,
                timestamp: Date.now()
            });

            // Embed de confirmação
            const embed = new EmbedBuilder()
                .setTitle('✅ **PEDIDO CONFIRMADO**')
                .setDescription('Revise seus dados antes de finalizar:')
                .setColor(colors.success)
                .setThumbnail('https://cdn.discordapp.com/emojis/1063274999993266216.webp')
                .addFields(
                    { name: '🎁 **Kit Selecionado**', value: kitEncontrado.nome, inline: true },
                    { name: '💰 **Valor Total**', value: `R$ ${kitEncontrado.preco.toFixed(2)}`, inline: true },
                    { name: '👤 **Dados do Comprador**', value: `Tag: ${discordTag}\nID: ${interaction.user.id}`, inline: false }
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
                content: '❌ Erro ao processar seu pedido. Tente novamente.', 
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
                    content: '❌ Pedido não encontrado. Inicie uma nova compra.', 
                    ephemeral: true 
                });
                return;
            }

            // 1. ENVIAR DETALHES DO PEDIDO PARA O CLIENTE
            const user = await client.users.fetch(interaction.user.id);
            
            const embedPagamento = new EmbedBuilder()
                .setTitle('💰 **PAGAMENTO VIA PIX**')
                .setDescription('**Siga os passos abaixo para finalizar sua compra:**')
                .setColor(colors.info)
                .setThumbnail('https://cdn.discordapp.com/emojis/1063275000517566464.webp')
                .addFields(
                    { name: '🎁 **Seu Pedido**', value: pedido.kit, inline: true },
                    { name: '💵 **Valor**', value: `R$ ${pedido.preco.toFixed(2)}`, inline: true },
                    { name: '🔑 **CHAVE PIX**', value: `\`\`\`${config.seuPix}\`\`\``, inline: false },
                    { name: '📱 **Como Pagar**', value: '1. Copie a chave PIX acima\n2. Abra seu app bancário\n3. Cole no campo PIX\n4. Confirme o pagamento', inline: false },
                    { name: '📸 **Comprovante**', value: 'Após pagar, envie o comprovante aqui mesmo!', inline: false }
                )
                .setFooter({ text: 'Pagamento 100% seguro • Entrega rápida' })
                .setTimestamp();

            await user.send({ 
                content: '🛒 **SEU PEDIDO ESTÁ QUASE PRONTO!**', 
                embeds: [embedPagamento] 
            });

            // 2. SOLICITAR DADOS DE ENTREGA
            const embedEntrega = new EmbedBuilder()
                .setTitle('🚚 **DADOS PARA ENTREGA**')
                .setDescription('Preencha os dados abaixo para receber seu kit:')
                .setColor(colors.warning)
                .addFields(
                    { name: '📍 Coordenadas', value: 'Onde quer receber o kit no servidor', inline: false },
                    { name: '🎮 Nick Minecraft', value: 'Seu nome no jogo', inline: false },
                    { name: '⏰ Tempo de Entrega', value: 'Após confirmação do pagamento', inline: false }
                )
                .setFooter({ text: 'Clique no botão abaixo para preencher' });

            const rowEntrega = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('preencher_entrega')
                    .setLabel('📋 Preencher Dados de Entrega')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📍')
            );

            await user.send({ 
                content: '**📦 INFORME ONDE RECEBER SEU KIT:**', 
                embeds: [embedEntrega], 
                components: [rowEntrega] 
            });

            // 3. NOTIFICAR O VENDEDOR
            try {
                const adminUser = await client.users.fetch(config.seuId);
                
                const embedNotificacao = new EmbedBuilder()
                    .setTitle('🛒 **NOVO PEDIDO RECEBIDO!**')
                    .setDescription(`**Cliente:** ${interaction.user.tag}`)
                    .setColor(colors.success)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        { name: '🎁 **Kit**', value: pedido.kit, inline: true },
                        { name: '💰 **Valor**', value: `R$ ${pedido.preco.toFixed(2)}`, inline: true },
                        { name: '👤 **Tag Discord**', value: pedido.discordTag, inline: true },
                        { name: '🆔 **User ID**', value: interaction.user.id, inline: true },
                        { name: '📞 **Contato Rápido**', value: `[Clique aqui](https://discord.com/users/${interaction.user.id})`, inline: false }
                    )
                    .setFooter({ text: 'Aguardando pagamento' })
                    .setTimestamp();

                await adminUser.send({ 
                    content: `🔔 **NOVO PEDIDO - ${pedido.kit}**`, 
                    embeds: [embedNotificacao] 
                });

            } catch (adminError) {
                console.error('❌ Erro ao notificar admin:', adminError);
            }

            // 4. CONFIRMAÇÃO FINAL
            const embedFinal = new EmbedBuilder()
                .setTitle('✅ **COMPRA FINALIZADA!**')
                .setDescription('Seu pedido foi processado com sucesso!')
                .setColor(colors.success)
                .addFields(
                    { name: '📨 **Mensagens Enviadas**', value: '• Detalhes do PIX\n• Formulário de entrega', inline: false },
                    { name: '📞 **Próximos Passos**', value: '1. Verifique suas mensagens privadas\n2. Faça o pagamento PIX\n3. Preencha os dados de entrega\n4. Envie o comprovante', inline: false }
                )
                .setFooter({ text: 'Obrigado pela preferência! 🎉' })
                .setTimestamp();

            await interaction.update({ 
                embeds: [embedFinal], 
                components: [] 
            });

        } catch (error) {
            console.error('❌ Erro ao finalizar compra:', error);
            await interaction.reply({ 
                content: '❌ Erro ao processar pagamento. Tente novamente.', 
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
                .setRequired(true)
                .setMaxLength(100);

            const nickInput = new TextInputBuilder()
                .setCustomId('nick_minecraft')
                .setLabel('🎮 Seu Nick no Minecraft')
                .setPlaceholder('Ex: SuperJogador123')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(20);

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
            const embedConfirmacao = new EmbedBuilder()
                .setTitle('✅ **DADOS REGISTRADOS!**')
                .setDescription('Seus dados de entrega foram salvos com sucesso!')
                .setColor(colors.success)
                .addFields(
                    { name: '📍 **Coordenadas**', value: coordenadas, inline: false },
                    { name: '🎮 **Nick Minecraft**', value: nickMinecraft, inline: true },
                    { name: '🎁 **Kit**', value: pedido.kit, inline: true },
                    { name: '📞 **Status**', value: 'Aguardando confirmação do pagamento', inline: false }
                )
                .setFooter({ text: 'Envie o comprovante do PIX quando fizer o pagamento' })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embedConfirmacao], 
                ephemeral: true 
            });

            // Notificar o vendedor com dados completos
            try {
                const adminUser = await client.users.fetch(config.seuId);
                
                const embedVendedor = new EmbedBuilder()
                    .setTitle('🚚 **DADOS DE ENTREGA CONFIRMADOS**')
                    .setDescription(`**Cliente:** ${interaction.user.tag}`)
                    .setColor(colors.info)
                    .setThumbnail('https://cdn.discordapp.com/emojis/1063275000236548116.webp')
                    .addFields(
                        { name: '🎁 **Kit**', value: pedido.kit, inline: true },
                        { name: '💰 **Valor**', value: `R$ ${pedido.preco.toFixed(2)}`, inline: true },
                        { name: '📍 **Coordenadas**', value: coordenadas, inline: false },
                        { name: '🎮 **Nick Minecraft**', value: nickMinecraft, inline: true },
                        { name: '👤 **Tag Discord**', value: pedido.discordTag, inline: true },
                        { name: '🆔 **User ID**', value: interaction.user.id, inline: true }
                    )
                    .setFooter({ text: 'Aguardando comprovante de pagamento' })
                    .setTimestamp();

                await adminUser.send({ 
                    content: `📦 **DADOS DE ENTREGA - ${pedido.kit}**`, 
                    embeds: [embedVendedor] 
                });

                // Limpar pedido da memória temporária
                pedidosTemp.delete(interaction.user.id);

            } catch (adminError) {
                console.error('❌ Erro ao enviar dados para vendedor:', adminError);
            }

        } catch (error) {
            console.error('❌ Erro ao processar entrega:', error);
            await interaction.reply({ 
                content: '❌ Erro ao salvar dados de entrega.', 
                ephemeral: true 
            });
        }
    }
});

// 🔧 REGISTRAR COMANDOS
client.once('ready', async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(config.token);
        
        const commands = [{
            name: 'comprar',
            description: '🛍️ Acessar a loja de kits',
            options: []
        }];

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );

        console.log('✅ Comandos registrados com sucesso!');
        console.log('🏪 Bot pronto para vendas!');

    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
});

// 🚀 INICIAR BOT
client.login(config.token).catch(error => {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
});

// 🛡️ TRATAMENTO DE ERROS GLOBAIS
process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error);
});
