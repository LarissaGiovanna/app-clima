# 0001. Motor de Alertas Climáticos Locais Baseado em Limiares de Previsão

A aplicação necessita de um sistema de alertas meteorológicos recentes para alimentar o sino de notificações, mas provedores gratuitos globais (como Open-Meteo) não oferecem feed de defesa civil municipal brasileira em planos públicos sem chaves de API pagas.

Decidimos sintetizar os alertas climáticos no cliente através de um motor de regras que inspeciona as projeções horárias reais da localização selecionada (limiares de precipitação intensa WMO ≥ 65, probabilidade de chuva > 70%, rajadas de vento > 30 km/h, umidade crítica < 30% ou calor extremo > 35°C), associando carimbos de data/hora aos eventos detectados.

Essa abordagem elimina custos com APIs pagas e dependências externas proprietárias, mantém o aplicativo 100% funcional sem autenticação e permite que os alertas continuem operando mesmo com previsões em cache offline.
