# Modèle de Données Avancé - Système de Tarification

## 🏗️ Architecture Entités

### 1. Entité Principale : **TariffDefinition**
```
- ID (AutoNumber)
- Name (String) - "Tarif EDF Particulier 2025"
- EnergyType (Enum) - Elec, Gaz, Eau, Air
- TariffType (Enum) - BASE, HOURLY, TIERED, SEASONAL, CONTRACT
- Status (Enum) - DRAFT, ACTIVE, EXPIRED, ARCHIVED
- ValidFrom (DateTime)
- ValidTo (DateTime)
- CreatedBy (String)
- CreatedDate (DateTime)
- LastModified (DateTime)
- Version (Integer)
```

### 2. Polymorphe : **BasePriceRule** (Generalization)
```
- ID (AutoNumber)
- TariffDefinition (Association)
- RuleType (String) - "BASE", "HOURLY", "TIERED", etc.
- Priority (Integer)
- IsActive (Boolean)
```

### 3. Spécialisations

#### **HourlyPriceRule** (Specialization of BasePriceRule)
```
- StartHour (Integer) - 0-23
- EndHour (Integer) - 0-23
- DayOfWeek (Enum) - MON, TUE, WED, THU, FRI, SAT, SUN, ALL
- PricePerUnit (Decimal)
- Unit (String)
- IsWeekend (Boolean)
- IsHoliday (Boolean)
```

#### **TieredPriceRule** (Specialization of BasePriceRule)
```
- TierLevel (Integer) - 1, 2, 3...
- MinConsumption (Decimal)
- MaxConsumption (Decimal)
- PricePerUnit (Decimal)
- Unit (String)
```

#### **SeasonalPriceRule** (Specialization of BasePriceRule)
```
- Season (Enum) - WINTER, SPRING, SUMMER, AUTUMN
- StartMonth (Integer) - 1-12
- EndMonth (Integer) - 1-12
- PriceMultiplier (Decimal) - 1.0 = normal, 1.2 = +20%
```

### 4. Entité de Calcul : **PriceCalculation**
```
- ID (AutoNumber)
- TariffDefinition (Association)
- CalculationDate (DateTime)
- ConsumptionAmount (Decimal)
- ConsumptionUnit (String)
- StartDateTime (DateTime)
- EndDateTime (DateTime)
- TotalPrice (Decimal)
- Currency (String)
- AppliedRules (String) - JSON des règles appliquées
- CalculationDetails (String) - JSON debug
```

### 5. Audit Trail : **TariffAuditLog**
```
- ID (AutoNumber)
- TariffDefinition (Association)
- Action (Enum) - CREATE, UPDATE, ACTIVATE, EXPIRE, ARCHIVE
- OldValue (String) - JSON
- NewValue (String) - JSON
- ChangedBy (String)
- ChangeDate (DateTime)
- Reason (String)
```

## 🔄 FSM - États des Tarifs

### États Définis
```typescript
enum TariffStatus {
    DRAFT = "DRAFT",           // En cours de création
    PENDING = "PENDING",       // En attente de validation
    ACTIVE = "ACTIVE",         // Actif et utilisable
    SUSPENDED = "SUSPENDED",   // Temporairement suspendu
    EXPIRED = "EXPIRED",       // Expiré naturellement
    ARCHIVED = "ARCHIVED"      // Archivé définitivement
}
```

### Transitions Autorisées
```
DRAFT → PENDING (validation request)
PENDING → ACTIVE (approval)
PENDING → DRAFT (rejection)
ACTIVE → SUSPENDED (emergency)
ACTIVE → EXPIRED (natural expiry)
SUSPENDED → ACTIVE (reactivation)
EXPIRED → ARCHIVED (cleanup)
```

## 🎯 Cas d'Usage Avancés

### 1. Tarif Heures Pleines/Creuses
```
TariffDefinition: "EDF Particulier HP/HC"
- HourlyPriceRule 1: 06:00-22:00, 0.1740€/kWh (Heures Pleines)
- HourlyPriceRule 2: 22:00-06:00, 0.1320€/kWh (Heures Creuses)
```

### 2. Tarif Progressive par Tranches
```
TariffDefinition: "Gaz Progressif"
- TieredPriceRule 1: 0-1000 kWh, 0.0820€/kWh
- TieredPriceRule 2: 1001-5000 kWh, 0.0950€/kWh
- TieredPriceRule 3: 5001+ kWh, 0.1100€/kWh
```

### 3. Tarif Saisonnier
```
TariffDefinition: "Chauffage Hivernal"
- SeasonalPriceRule 1: Hiver (Oct-Mar), x1.3
- SeasonalPriceRule 2: Été (Apr-Sep), x0.8
```

## 🔧 API Service Layer

### Interface IPricingEngine
```typescript
interface IPricingEngine {
    calculatePrice(
        tariffId: string,
        consumption: ConsumptionData,
        period: DateRange
    ): Promise<PriceCalculationResult>;
    
    validateTariff(tariff: TariffDefinition): ValidationResult;
    
    getApplicableTariffs(
        energyType: EnergyType,
        date: Date,
        criteria?: SearchCriteria
    ): Promise<TariffDefinition[]>;
}
```

### Exemple de Calcul Complexe
```typescript
// Calcul pour consommation 1500 kWh sur période mixte HP/HC
const result = await pricingEngine.calculatePrice(
    "tariff-edf-hphc-2025",
    {
        amount: 1500,
        unit: "kWh",
        hourlyBreakdown: [
            { hour: 8, consumption: 100 },  // HP
            { hour: 14, consumption: 200 }, // HP
            { hour: 23, consumption: 150 }  // HC
        ]
    },
    {
        start: new Date("2025-01-01"),
        end: new Date("2025-01-31")
    }
);

// Résultat détaillé
{
    totalPrice: 245.50,
    currency: "EUR",
    breakdown: {
        heuresPleinnes: { amount: 1200, price: 208.80 },
        heuresCreuses: { amount: 300, price: 36.70 }
    },
    appliedRules: ["HP-06-22", "HC-22-06"],
    taxes: 12.25
}
```

## 📋 Migration Strategy

### Phase 1: Foundation (2 semaines)
- Création nouvelles entités
- FSM pour états de base
- Widget de gestion simple

### Phase 2: Business Logic (3 semaines)
- Pricing Engine core
- Règles HP/HC
- Calculs basiques

### Phase 3: Advanced Features (4 semaines)
- Tarifs par tranches
- Règles saisonnières
- API complète

### Phase 4: Production (2 semaines)
- Migration données existantes
- Tests charge
- Monitoring

## 🔍 Points d'Attention

### Performance
- Index sur (EnergyType, ValidFrom, ValidTo, Status)
- Cache Redis pour tarifs actifs
- Pagination pour historiques

### Sécurité
- Validation stricte des règles de prix
- Audit complet des modifications
- Droits d'accès par rôle

### Maintenabilité
- Factory Pattern pour nouveaux types
- Strategy Pattern pour algorithmes de calcul
- Event Sourcing pour traçabilité complète 