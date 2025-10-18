
// Mock user data (shared between pages)
window.SUS_MOCK_USER = {
  nome: "Fulano de Tal",
  cpf: "000.000.000-00",
  consultas: [
    { id: 1, especialidade: "Clínico Geral", data: "2025-11-02 09:00", local: "UBS Centro" },
    { id: 2, especialidade: "Odontologia", data: "2025-12-05 14:00", local: "UBS Bairro Novo" }
  ],
  receitas: [
    { id: 1, medicamento: "Losartana 50mg", validade: "2025-12-01" }
  ],
  vacinas: [
    { nome: "COVID-19 (Reforço)", data: "2024-09-10" },
    { nome: "Febre Amarela", data: "2018-03-20" }
  ],
  exames: ["Hemograma","Glicemia","Colesterol"],
  unidades_proximas: [
    { nome: "UBS Centro", distancia_km: 1.2, telefone: "(11) 4000-0001" },
    { nome: "UBS Bairro Novo", distancia_km: 2.3, telefone: "(11) 4000-0002" },
    { nome: "Hospital Municipal", distancia_km: 3.1, telefone: "(11) 4000-0003" }
  ]
};
