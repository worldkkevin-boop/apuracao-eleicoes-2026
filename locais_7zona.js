/**
 * BASE OFICIAL TRE-AP / 7ª ZONA ELEITORAL
 * Mapeamento dos Locais de Votação, Bairros e Seções Eleitorais
 * Laranjal do Jari e Vitória do Jari
 */

var DADOS_7ZONA_ELEITORAL = {
  municipios: {
    laranjal_do_jari: {
      nome: "Laranjal do Jari",
      codigoTse: "06130",
      zona: "7ª Zona Eleitoral",
      totalSecoes: 108,
      eleitoradoEstimado: 32500,
      locais: [
        {
          id: "mineko_hayashida",
          nome: "Escola Estadual Mineko Hayashida",
          bairro: "Agreste",
          tipo: "Urbano",
          secoes: ["23", "24", "25", "26", "58", "65", "71", "117", "124", "128"],
          qtdSecoes: 10,
          pesoVotos: 0.115
        },
        {
          id: "nazare_rodrigues",
          nome: "Escola Estadual Nazaré Rodrigues",
          bairro: "Sarney / Agreste",
          tipo: "Urbano",
          secoes: ["30", "31", "32", "36", "37", "38", "53", "56", "68", "77", "86"],
          qtdSecoes: 11,
          pesoVotos: 0.120
        },
        {
          id: "tereza_teles",
          nome: "Escola Estadual Tereza Teles",
          bairro: "Centro / Buritizal",
          tipo: "Urbano",
          secoes: ["76", "83", "89", "90", "98", "102", "105", "108", "121", "126", "171"],
          qtdSecoes: 11,
          pesoVotos: 0.118
        },
        {
          id: "centro_municipal",
          nome: "Centro Municipal de Ensino",
          bairro: "Centro",
          tipo: "Urbano",
          secoes: ["13", "39", "64", "72", "78", "85", "87", "113", "132"],
          qtdSecoes: 9,
          pesoVotos: 0.095
        },
        {
          id: "vanda_cabete",
          nome: "Escola Estadual Vanda Cabete",
          bairro: "Malvinas",
          tipo: "Urbano",
          secoes: ["20", "21", "22", "28", "51", "81", "114", "169"],
          qtdSecoes: 8,
          pesoVotos: 0.088
        },
        {
          id: "sonia_henriques",
          nome: "Escola Municipal Sônia Henriques Barreto",
          bairro: "Prosperidade",
          tipo: "Urbano",
          secoes: ["69", "112", "115", "118", "122", "123", "125", "127"],
          qtdSecoes: 8,
          pesoVotos: 0.082
        },
        {
          id: "joao_queiroga",
          nome: "Escola Municipal João Queiroga",
          bairro: "Centro / Agreste",
          tipo: "Urbano",
          secoes: ["10/11", "12/88", "93", "99", "130"],
          qtdSecoes: 7,
          pesoVotos: 0.070
        },
        {
          id: "raimunda_capiberibe",
          nome: "Escola Estadual Raimunda Capiberibe",
          bairro: "Agreste",
          tipo: "Urbano",
          secoes: ["42/43", "44/47", "49/52", "66/73"],
          qtdSecoes: 8,
          pesoVotos: 0.075
        },
        {
          id: "terezinha_queiroga",
          nome: "Escola Municipal Terezinha Queiroga",
          bairro: "Centro",
          tipo: "Urbano",
          secoes: ["27", "29", "54", "57", "61"],
          qtdSecoes: 5,
          pesoVotos: 0.048
        },
        {
          id: "paulo_freire",
          nome: "Escola Estadual Paulo Freire",
          bairro: "Samaúma",
          tipo: "Urbano",
          secoes: ["14", "15", "16", "106", "110"],
          qtdSecoes: 5,
          pesoVotos: 0.045
        },
        {
          id: "weber_eider",
          nome: "Centro Educacional Weber Eider",
          bairro: "Malvinas",
          tipo: "Urbano",
          secoes: ["17", "18", "19", "60"],
          qtdSecoes: 4,
          pesoVotos: 0.038
        },
        {
          id: "zelia_conceicao",
          nome: "Escola Municipal Zélia Conceição",
          bairro: "Nazaré Mineiro / Centro",
          tipo: "Urbano",
          secoes: ["103", "109", "120", "178"],
          qtdSecoes: 4,
          pesoVotos: 0.035
        },
        {
          id: "emilio_medice",
          nome: "Escola Municipal Emílio Médice",
          bairro: "Centro",
          tipo: "Urbano",
          secoes: ["62/74", "104/107"],
          qtdSecoes: 4,
          pesoVotos: 0.032
        },
        {
          id: "santa_lucia",
          nome: "Escola Municipal Santa Lúcia",
          bairro: "Castanheira / Malvinas",
          tipo: "Urbano",
          secoes: ["82", "94", "111"],
          qtdSecoes: 3,
          pesoVotos: 0.026
        },
        {
          id: "mundo_encantado",
          nome: "Escola Mundo Encantado",
          bairro: "Centro",
          tipo: "Urbano",
          secoes: ["170", "177", "182"],
          qtdSecoes: 3,
          pesoVotos: 0.022
        },
        {
          id: "bom_amigo_mandi",
          nome: "Comunidade Bom Amigo Mandi",
          bairro: "Zona Rural",
          tipo: "Rural",
          secoes: ["119", "131", "175"],
          qtdSecoes: 3,
          pesoVotos: 0.016
        },
        {
          id: "agua_branca_cajari",
          nome: "Comunidade Água Branca do Cajari",
          bairro: "Resex Cajari",
          tipo: "Rural",
          secoes: ["02", "03", "185"],
          qtdSecoes: 3,
          pesoVotos: 0.015
        },
        {
          id: "nazare_mineiro",
          nome: "Comunidade Nazaré Mineiro",
          bairro: "Zona Rural",
          tipo: "Rural",
          secoes: ["116", "129"],
          qtdSecoes: 2,
          pesoVotos: 0.011
        },
        {
          id: "padaria",
          nome: "Comunidade Padaria",
          bairro: "Zona Rural",
          tipo: "Rural",
          secoes: ["41/79"],
          qtdSecoes: 2,
          pesoVotos: 0.009
        },
        {
          id: "conceicao_muriaca",
          nome: "Comunidade Conceição do Muriacá",
          bairro: "Resex Cajari / Ribeirinha",
          tipo: "Rural",
          secoes: ["34"],
          qtdSecoes: 1,
          pesoVotos: 0.005
        },
        {
          id: "cristo_redentor",
          nome: "Comunidade Cristo Redentor (Martins)",
          bairro: "Zona Rural",
          tipo: "Rural",
          secoes: ["133"],
          qtdSecoes: 1,
          pesoVotos: 0.005
        },
        {
          id: "waldemar_borges",
          nome: "Comunidade Waldemar Borges (Boca do Braço)",
          bairro: "Zona Rural",
          tipo: "Rural",
          secoes: ["91"],
          qtdSecoes: 1,
          pesoVotos: 0.004
        },
        {
          id: "iratapuru",
          nome: "Reserva Extrativista do Iratapuru",
          bairro: "Resex Iratapuru",
          tipo: "Rural",
          secoes: ["92"],
          qtdSecoes: 1,
          pesoVotos: 0.004
        },
        {
          id: "santa_clara",
          nome: "Comunidade Santa Clara (São Pedro)",
          bairro: "Zona Rural",
          tipo: "Rural",
          secoes: ["186"],
          qtdSecoes: 1,
          pesoVotos: 0.003
        }
      ]
    },

    vitoria_do_jari: {
      nome: "Vitória do Jari",
      codigoTse: "06122",
      zona: "7ª Zona Eleitoral",
      totalSecoes: 45,
      eleitoradoEstimado: 12400,
      locais: [
        {
          id: "munguba_do_jari",
          nome: "Escola Estadual Munguba do Jarí",
          bairro: "Munguba / Centro",
          tipo: "Urbano",
          secoes: ["134/135", "136/137", "138/139", "140/141", "142", "143", "144"],
          qtdSecoes: 11,
          pesoVotos: 0.280
        },
        {
          id: "francisca_freitas",
          nome: "Escola Municipal Francisca de Freitas Araújo",
          bairro: "Prainha / Centro",
          tipo: "Urbano",
          secoes: ["154", "155", "156", "157", "158", "159", "160", "161"],
          qtdSecoes: 8,
          pesoVotos: 0.220
        },
        {
          id: "alvaro_marquez",
          nome: "Escola Municipal Álvaro Márquez Gonçalves",
          bairro: "Centro",
          tipo: "Urbano",
          secoes: ["162", "163", "164", "165", "166", "167", "168"],
          qtdSecoes: 7,
          pesoVotos: 0.170
        },
        {
          id: "benedito_penelva",
          nome: "Escola Municipal Benedito Lima Penelva",
          bairro: "Guanabara",
          tipo: "Urbano",
          secoes: ["149", "150", "151", "152", "153"],
          qtdSecoes: 5,
          pesoVotos: 0.120
        },
        {
          id: "felinto_batista",
          nome: "Escola Municipal Felinto Batista",
          bairro: "São José",
          tipo: "Urbano",
          secoes: ["173", "176", "179", "184"],
          qtdSecoes: 4,
          pesoVotos: 0.085
        },
        {
          id: "teotonio_vilela",
          nome: "Escola Estadual Teotônio Brandão Vilela",
          bairro: "Munguba",
          tipo: "Urbano",
          secoes: ["172", "174", "180"],
          qtdSecoes: 3,
          pesoVotos: 0.055
        },
        {
          id: "jarilandia",
          nome: "Escola Estadual Jarilândia",
          bairro: "Distrito Jarilândia",
          tipo: "Distrito",
          secoes: ["145", "146", "181"],
          qtdSecoes: 3,
          pesoVotos: 0.040
        },
        {
          id: "sao_joao_cajari",
          nome: "Escola de 1º Grau São João do Cajari",
          bairro: "Zona Rural",
          tipo: "Rural",
          secoes: ["147"],
          qtdSecoes: 1,
          pesoVotos: 0.010
        },
        {
          id: "aterro_muriaca",
          nome: "Escola Municipal Aterro do Muriacá",
          bairro: "Ribeirinha",
          tipo: "Rural",
          secoes: ["148"],
          qtdSecoes: 1,
          pesoVotos: 0.008
        },
        {
          id: "ilhas_aruas",
          nome: "Centro Comunitário Ilhas Aruãs",
          bairro: "Ilhas Aruãs / Ribeirinha",
          tipo: "Rural",
          secoes: ["183"],
          qtdSecoes: 1,
          pesoVotos: 0.007
        },
        {
          id: "tapereira",
          nome: "Escola Municipal de Tapereira",
          bairro: "Zona Rural",
          tipo: "Rural",
          secoes: ["187"],
          qtdSecoes: 1,
          pesoVotos: 0.005
        }
      ]
    }
  },

  // Relação de todos os 16 Municípios do Amapá para a visão estadual
  municipiosAmapa: [
    { nome: "Macapá", codigo: "06050", zona: "2ª e 10ª Zonas", pesoEleitoral: 0.580 },
    { nome: "Santana", codigo: "06157", zona: "6ª Zona", pesoEleitoral: 0.150 },
    { nome: "Laranjal do Jari", codigo: "06130", zona: "7ª Zona", pesoEleitoral: 0.075 },
    { nome: "Vitória do Jari", codigo: "06122", zona: "7ª Zona", pesoEleitoral: 0.025 },
    { nome: "Mazagão", codigo: "06076", zona: "5ª Zona", pesoEleitoral: 0.035 },
    { nome: "Porto Grande", codigo: "06025", zona: "11ª Zona", pesoEleitoral: 0.030 },
    { nome: "Oiapoque", codigo: "06092", zona: "4ª Zona", pesoEleitoral: 0.028 },
    { nome: "Pedra Branca do Amapari", codigo: "06084", zona: "13ª Zona", pesoEleitoral: 0.018 },
    { nome: "Tartarugalzinho", codigo: "06173", zona: "9ª Zona", pesoEleitoral: 0.016 },
    { nome: "Amapá", codigo: "06017", zona: "1ª Zona", pesoEleitoral: 0.012 },
    { nome: "Calçoene", codigo: "06033", zona: "1ª Zona", pesoEleitoral: 0.010 },
    { nome: "Ferreira Gomes", codigo: "06114", zona: "11ª Zona", pesoEleitoral: 0.008 },
    { nome: "Cutias", codigo: "06068", zona: "3ª Zona", pesoEleitoral: 0.005 },
    { nome: "Itaubal", codigo: "06041", zona: "3ª Zona", pesoEleitoral: 0.004 },
    { nome: "Serra do Navio", codigo: "06106", zona: "13ª Zona", pesoEleitoral: 0.003 },
    { nome: "Pracuúba", codigo: "06009", zona: "9ª Zona", pesoEleitoral: 0.002 }
  ]
};
