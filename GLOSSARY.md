# App Clima

Vocabulário canônico para a aplicação de previsão do tempo, especificando as entidades de domínio e métricas meteorológicas.

## Entidades de Domínio

**Localização**:
Ponto geográfico definido por coordenadas (latitude e longitude), cidade e estado/país de referência.
_Avoid_: Ponto, Lugar, GPS, Endereço

**ClimaAtual**:
Instantâneo das condições meteorológicas observadas no momento atual para uma localização.
_Avoid_: Tempo, Estado, Relatório, Status

**MétricasClimáticas**:
Conjunto dos três indicadores imediatos do clima: probabilidade de precipitação (%), umidade do ar (%) e velocidade do vento (km/h).
_Avoid_: Estatísticas, Detalhes, Indicadores

**PrevisãoHorária**:
Projeção de temperatura e condição meteorológica estimada em intervalos de uma hora para o dia vigente.
_Avoid_: Linha do tempo, Histórico, Horas

**PrevisãoDiária**:
Projeção resumida das condições e variação de temperatura máxima e mínima para os próximos 7 dias.
_Avoid_: Calendário, Futuro, Semanal

**AlertaClimático**:
Aviso ou notificação meteorológica de eventos recentes ou iminentes (como chuvas fortes, vendavais ou extremos de temperatura) associado à localização.
_Avoid_: Notificação genérica, Mensagem, Aviso

**TemaClimático**:
Configuração visual de paleta de cores e gradientes da interface, alternada entre modo diurno ensolarado e modo noturno/adverso de acordo com as condições meteorológicas da localização.
_Avoid_: Modo escuro genérico, Skin, Template
