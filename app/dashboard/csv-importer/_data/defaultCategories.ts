export interface DefaultCategory {
  name: string
  color: string
  icon: string
  keywords: string[]
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Alimentação',
    color: '#10B981',
    icon: '🍔',
    keywords: [
      'ifood', 'ifoods', 'i food', 'i-food', 'ifood.com', 'ifoodcom',
      
      'uber eats', 'ubereats', 'rappi', 'delivery', 'comida', 'restaurante', 
      'lanche', 'lanches', 'alimentos', 'alimentacao', 'mercado', 'supermercado', 
      'padaria', 'acougue', 'hortifruti', 'pizza', 'hamburger', 'hamburguer',
      'mcdonalds', 'burger king', 'kfc', 'subway', 'pizzaria', 'sorveteria',
      'cafe', 'cafeteria', 'bar', 'boteco', 'cerveja', 'refrigerante',
      'agua', 'bebida', 'doce', 'chocolate', 'sorvete', 'bolacha', 'biscoito',
      
      'extra', 'carrefour', 'pao de acucar', 'big', 'atacadao', 'walmart',
      'sams club', 'makro', 'assai',
      
      'outback', 'mc donalds', 'bobs', 'girafas', 'china box', 'divino fogao',
      'lanchonete', 'pastelaria', 'churrascaria', 'grill', 'cozinha',
      'compras', 'alimentar', 'nutricao', 'feira', 'quitanda',
      'macarrao', 'macarraoirma', 'massa', 'lanch', 'marcinho', 'marcinholanch',
      
      'lojas americanas', 'americanas', 'loja americana', 'magazine luiza',
      'magalu', 'casas bahia'
    ]
  },
  {
    name: 'Transporte',
    color: '#3B82F6',
    icon: '🚗',
    keywords: [
      'uber', '99', '99 taxi', '99taxi', 'taxi', 'riopar', 'riocard', 
      'transporte', 'onibus', 'metro', 'trem', 
      
      'gasolina', 'combustivel', 'posto', 'shell', 'petrobras', 'ipiranga', 
      'br', 'etanol', 'alcool', 'diesel', 'ale sat', 'alesat',
      
      'estacionamento', 'zona azul', 'pedagio', 'vignette', 'multa',
      'detran', 'renavam', 'ipva', 'seguro auto', 'manutencao',
      'vlt', 'brt', 'metro rio', 'supervia', 'auto',
      'viacao', 'rodoviaria', 'passagem', 'bilhete', 'cartao transporte',
      'aplicativo', 'carona', 'mobilidade', 'viagem', 'translado'
    ]
  },
  {
    name: 'Saúde',
    color: '#EF4444',
    icon: '🏥',
    keywords: [
      'farmacia', 'drogaria', 'drogasil', 'pacheco', 'raia', 'medico', 
      'hospital', 'clinica', 'laboratorio', 'dentista', 'oftalmologista', 
      'cardiologista', 'ginecologista', 'remedio', 'medicamento', 'exame', 
      'consulta', 'internacao', 'cirurgia', 'plano de saude', 'unimed', 
      'amil', 'bradesco saude', 'sul america', 'golden cross', 'hapvida', 
      'prevent senior', 'porto seguro saude'
    ]
  },
  {
    name: 'Casa',
    color: '#F59E0B',
    icon: '🏠',
    keywords: [
      'aluguel', 'condominio', 'iptu', 'luz', 'energia', 'enel', 'light',
      'cemig', 'copel', 'agua', 'saneamento', 'sabesp', 'cedae',
      'gas', 'comgas', 'ultragaz', 'liquigas', 
      
      'internet', 'wifi', 'vivo', 'claro', 'tim', 'oi', 'sky', 'net', 'telefone',
      
      'limpeza', 'diarista', 'empregada', 'porteiro', 'zelador',
      'reforma', 'pintura', 'eletricista', 'encanador', 'marceneiro',
      
      'pet', 'american pet', 'americanpet', 'petshop', 'veterinario', 'animal',
      'racao', 'vacina animal'
    ]
  },
  {
    name: 'Lazer',
    color: '#8B5CF6',
    icon: '🎮',
    keywords: [
      'netflix', 'spotify', 'amazon prime', 'disney plus', 'globoplay',
      'youtube premium', 'paramount', 'hbo max', 'prime video',
      
      'cinema', 'teatro', 'show', 'festa', 'balada', 'jogo', 'game', 
      'steam', 'playstation', 'xbox', 'nintendo',
      
      'viagem', 'hotel', 'pousada', 'airbnb', 'booking', 'decolar',
      'parque', 'zoologico', 'museu', 'exposicao', 'livro', 'revista',
      
      'academia', 'personal', 'natacao', 'futebol', 'basquete', 'gym'
    ]
  },
  {
    name: 'Educação',
    color: '#06B6D4',
    icon: '📚',
    keywords: [
      'escola', 'colegio', 'universidade', 'faculdade', 'curso',
      'aula', 'professor', 'mensalidade', 'material escolar',
      'livro didatico', 'caderno', 'caneta', 'lapis', 'mochila',
      'uniforme', 'formatura', 'diploma', 'certificado', 'pos graduacao'
    ]
  },
  {
    name: 'Vestuário',
    color: '#EC4899',
    icon: '👕',
    keywords: [
      'roupa', 'roupas', 'camisa', 'calca', 'vestido', 'saia',
      'sapato', 'tenis', 'sandalia', 'bolsa', 'carteira', 'cinto',
      
      'oculos', 'relogio', 'joia', 'anel', 'colar', 'brinco',
      
      'perfume', 'maquiagem', 'cosmetico', 'shampoo', 'condicionador',
      'creme', 'protetor solar', 'barbeiro', 'cabeleireiro', 'salao',
      
      'renner', 'loja renner', 'lojas renner', 'zara', 'hm', 'h&m', 
      'c&a', 'marisa', 'riachuelo', 'posthaus'
    ]
  },
  {
    name: 'Investimentos',
    color: '#059669',
    icon: '📈',
    keywords: [
      'investimento', 'aplicacao', 'poupanca', 'cdb', 'lci', 'lca',
      'tesouro', 'acao', 'fundo', 'previdencia', 'bitcoin', 'crypto',
      'criptomoeda', 'corretora', 'xp', 'rico', 'clear', 'easynvest',
      'nuinvest', 'inter', 'bradesco', 'itau', 'santander', 'bb',
      'btg pactual', 'modal'
    ]
  },
  {
    name: 'Outros',
    color: '#6B7280',
    icon: '📦',
    keywords: [
      'outros', 'diverso', 'geral', 'misc', 'variado',
      'fatura', 'pagamento', 'conta', 'boleto', 'cartao',
      'transferencia', 'pix', 'ted', 'doc', 'saque', 'deposito'
    ]
  }
] 
