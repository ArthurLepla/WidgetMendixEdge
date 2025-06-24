## Niveaux hiérarchiques
- **Usine** (Level 1)  
  - Nom (String)  
  - ConsoTotalElec (Decimal)  
  - …  
  - isElec / isGaz / isAir / isEau (Boolean)

- **Secteur** (Level 2)  
  - Usine (String – FK)  
  - ConsoTotalGaz (Decimal)  
  - …

- **Atelier** (Level 3)  
  - Secteur (String – FK)  
  - …

- **ETH** (Level 4)  
  …

- **Machine** (Level 5)  
  - Identifiant (String)  
  - Usine / Secteur / Atelier / ETH (FK)  
  - TotalKwhElec (Decimal)  
  - TotalConso (Decimal)  
  - TotalProd (Decimal)

### Tables de mesures
- **Measure_Usine** : Identifiant, Timestamp (DateTime), Value (Decimal), Consumption (Decimal)  
- **Measure_Secteur** : …  
