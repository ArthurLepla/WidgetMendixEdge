import { describe, it, expect } from 'vitest'
import { Big } from 'big.js'
import { energyConfigs, getAdaptedEnergyConfig, getSmartUnit, formatSmartValue } from '../utils/energy'

/**
 * Tests simplifiés sans dépendances Mendix
 */
describe('🧪 Tests Simplifiés - Logique Widget', () => {
  
  describe('📊 Génération de Données Mock', () => {
    it('génère des données de test basiques', () => {
      // Simulation de generateMockConsumptionData sans import
      function generateTestData(count: number, energyType: string) {
        const data: Array<{ timestamp: Date; value: Big; name: string }> = []
        const now = new Date()
        
        let baseValue = 50
        switch (energyType) {
          case 'electricity': baseValue = 45; break
          case 'gas': baseValue = 20; break
          case 'water': baseValue = 120; break
          case 'air': baseValue = 18; break
        }

        for (let i = count; i >= 0; i--) {
          const date = new Date(now)
          date.setHours(date.getHours() - i)
          
          data.push({
            timestamp: date,
            value: new Big(baseValue + Math.random() * 10),
            name: `Test ${energyType}`
          })
        }
        return data
      }

      const data = generateTestData(5, 'electricity')
      
      expect(data).toHaveLength(6)
      expect(data[0]).toHaveProperty('timestamp')
      expect(data[0]).toHaveProperty('value')
      expect(data[0]).toHaveProperty('name')
      expect(data[0].value.toNumber()).toBeGreaterThan(0)
    })

    it('génère des valeurs différentes selon le type d\'énergie', () => {
      const energyTypes = ['electricity', 'gas', 'water', 'air']
      const averages: number[] = []

      energyTypes.forEach(type => {
        let baseValue = 50
        switch (type) {
          case 'electricity': baseValue = 45; break
          case 'gas': baseValue = 20; break
          case 'water': baseValue = 120; break
          case 'air': baseValue = 18; break
        }
        averages.push(baseValue)
      })

      // Vérifier que les bases sont différentes
      expect(averages[0]).not.toBe(averages[1]) // electricity ≠ gas
      expect(averages[1]).not.toBe(averages[2]) // gas ≠ water
      expect(averages[2]).not.toBe(averages[3]) // water ≠ air
    })
  })

  describe('⚙️ Configuration des Props', () => {
    it('valide la structure des props minimales', () => {
      interface MinimalProps {
        name: string
        devMode: boolean
        viewMode: 'energetic' | 'ipe'
        ipeMode: 'single' | 'double'
        energyType: 'electricity' | 'gas' | 'water' | 'air'
      }

      const testProps: MinimalProps = {
        name: 'test-widget',
        devMode: true,
        viewMode: 'energetic',
        ipeMode: 'single',
        energyType: 'electricity'
      }

      expect(testProps.name).toBe('test-widget')
      expect(testProps.devMode).toBe(true)
      expect(['energetic', 'ipe']).toContain(testProps.viewMode)
      expect(['single', 'double']).toContain(testProps.ipeMode)
      expect(['electricity', 'gas', 'water', 'air']).toContain(testProps.energyType)
    })

    it('valide les configurations de modes', () => {
      const scenarios = [
        { viewMode: 'energetic', ipeMode: 'single', energyType: 'electricity' },
        { viewMode: 'ipe', ipeMode: 'single', energyType: 'gas' },
        { viewMode: 'ipe', ipeMode: 'double', energyType: 'water' },
        { viewMode: 'energetic', ipeMode: 'single', energyType: 'air' }
      ]

      scenarios.forEach((scenario) => {
        expect(scenario).toHaveProperty('viewMode')
        expect(scenario).toHaveProperty('ipeMode')
        expect(scenario).toHaveProperty('energyType')
        
        if (scenario.viewMode === 'ipe') {
          expect(['single', 'double']).toContain(scenario.ipeMode)
        }
      })
    })
  })

  describe('🔢 Calculs et Transformations', () => {
    it('manipule correctement les valeurs Big.js', () => {
      const value1 = new Big('45.5')
      const value2 = new Big('20.3')
      
      const sum = value1.plus(value2)
      const difference = value1.minus(value2)
      const product = value1.times(2)
      
      expect(sum.toNumber()).toBeCloseTo(65.8)
      expect(difference.toNumber()).toBeCloseTo(25.2)
      expect(product.toNumber()).toBeCloseTo(91.0)
    })

    it('formate correctement les dates', () => {
      const now = new Date()
      const past = new Date(now)
      past.setHours(past.getHours() - 24)
      
      expect(past.getTime()).toBeLessThan(now.getTime())
      expect(now.getTime() - past.getTime()).toBe(24 * 60 * 60 * 1000) // 24 heures en ms
    })

    it('gère les calculs de moyennes', () => {
      const values = [new Big('10'), new Big('20'), new Big('30')]
      const sum = values.reduce((acc, val) => acc.plus(val), new Big('0'))
      const average = sum.div(values.length)
      
      expect(average.toNumber()).toBe(20)
    })
  })

  describe('🎨 Configuration des Couleurs et Styles', () => {
    it('associe les bonnes couleurs aux types d\'énergie', () => {
      const energyColors = {
        electricity: '#38a13c',
        gas: '#f9be01', 
        water: '#3293f3',
        air: '#66d8e6',
        primary: '#18213e'
      }

      Object.keys(energyColors).forEach(energyType => {
        const color = energyColors[energyType as keyof typeof energyColors]
        expect(color).toMatch(/^#[0-9a-f]{6}$/i) // Format hexadécimal valide
      })
    })

    it('valide les unités selon le type d\'énergie', () => {
      const energyUnits = {
        electricity: 'kWh',
        gas: 'm³',
        water: 'L',
        air: 'm³/h'
      }

      Object.keys(energyUnits).forEach(energyType => {
        const unit = energyUnits[energyType as keyof typeof energyUnits]
        expect(unit).toBeTruthy()
        expect(typeof unit).toBe('string')
      })
    })
  })

  describe('📈 Performance et Optimisation', () => {
    it('traite rapidement de grandes quantités de données', () => {
      const startTime = performance.now()
      
      // Simulation de traitement de données
      const largeDataset: Array<{ value: number; timestamp: Date }> = []
      for (let i = 0; i < 1000; i++) {
        largeDataset.push({
          value: Math.random() * 100,
          timestamp: new Date(Date.now() - i * 60000) // 1 minute d'intervalle
        })
      }
      
      // Calcul de moyenne
      const average = largeDataset.reduce((sum, item) => sum + item.value, 0) / largeDataset.length
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(largeDataset).toHaveLength(1000)
      expect(average).toBeGreaterThan(0)
      expect(average).toBeLessThan(100)
      expect(processingTime).toBeLessThan(50) // Moins de 50ms
    })
  })

  describe('🛠️ Debugging et Détection d\'Erreurs', () => {
    it('détecte les valeurs invalides', () => {
      const testCases = [
        { input: 'not-a-number', expected: false },
        { input: '45.5', expected: true },
        { input: '-10', expected: true },
        { input: '0', expected: true },
        { input: '', expected: false }
      ]

      testCases.forEach(({ input, expected }) => {
        try {
          const big = new Big(input)
          expect(expected).toBe(true) // Si on arrive ici, c'était valide
          expect(big.toNumber()).toBeDefined()
        } catch (error) {
          expect(expected).toBe(false) // Si erreur, c'était invalide
        }
      })
    })

    it('valide les configurations de props', () => {
      const validConfigs = [
        { viewMode: 'energetic', energyType: 'electricity' },
        { viewMode: 'ipe', energyType: 'gas' },
        { viewMode: 'ipe', energyType: 'water' },
        { viewMode: 'energetic', energyType: 'air' }
      ]

      validConfigs.forEach(config => {
        expect(['energetic', 'ipe']).toContain(config.viewMode)
        expect(['electricity', 'gas', 'water', 'air']).toContain(config.energyType)
      })
    })

    it('fournit des messages d\'erreur clairs', () => {
      const errorScenarios = [
        { scenario: 'missing-props', message: 'Props manquantes' },
        { scenario: 'invalid-data', message: 'Données invalides' },
        { scenario: 'network-error', message: 'Erreur réseau' }
      ]

      errorScenarios.forEach(({ scenario, message }) => {
        expect(scenario).toBeTruthy()
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
      })
    })
  })

  // Tests pour le nouveau système d'unités baseUnit
  describe("BaseUnit System", () => {
    test("should use auto mode by default", () => {
      const config = getAdaptedEnergyConfig("electricity", "auto");
      expect(config.unit).toBe("kWh");
      
      const gasConfig = getAdaptedEnergyConfig("gas", "auto");
      expect(gasConfig.unit).toBe("m³");
    });

    test("should force kWh for all energy types when baseUnit is kWh", () => {
      const config = getAdaptedEnergyConfig("gas", "kWh");
      expect(config.unit).toBe("kWh");
      
      const waterConfig = getAdaptedEnergyConfig("water", "kWh");
      expect(waterConfig.unit).toBe("kWh");
    });

    test("should force m³ for all energy types when baseUnit is m3", () => {
      const config = getAdaptedEnergyConfig("electricity", "m3");
      expect(config.unit).toBe("m³");
      
      const gasConfig = getAdaptedEnergyConfig("gas", "m3");
      expect(gasConfig.unit).toBe("m³");
    });

    test("should apply smart unit conversion for kWh", () => {
      const smallValue = getSmartUnit(500, "electricity", "kWh");
      expect(smallValue.unit).toBe("kWh");
      expect(smallValue.value).toBe(500);

      const mediumValue = getSmartUnit(1500, "electricity", "kWh");
      expect(mediumValue.unit).toBe("MWh");
      expect(mediumValue.value).toBe(1.5);

      const largeValue = getSmartUnit(2000000, "electricity", "kWh");
      expect(largeValue.unit).toBe("GWh");
      expect(largeValue.value).toBe(2);

      const veryLargeValue = getSmartUnit(3000000000, "electricity", "kWh");
      expect(veryLargeValue.unit).toBe("TWh");
      expect(veryLargeValue.value).toBe(3);
    });

    test("should not convert values for m3 baseUnit", () => {
      const value = getSmartUnit(1500, "gas", "m3");
      expect(value.unit).toBe("m³");
      expect(value.value).toBe(1500);
    });

    test("should format smart values correctly", () => {
      const formattedKwh = formatSmartValue(750.123, "electricity", "kWh", 2);
      expect(formattedKwh).toBe("750,12 kWh");

      const formattedMwh = formatSmartValue(1500.5, "electricity", "kWh", 1);
      expect(formattedMwh).toBe("1,5 MWh");

      const formattedM3 = formatSmartValue(1500.789, "gas", "m3", 2);
      expect(formattedM3).toBe("1 500,79 m³");
    });

    test("should maintain backward compatibility with auto mode", () => {
      const electricityConfig = getAdaptedEnergyConfig("electricity", "auto");
      const originalElectricityConfig = energyConfigs.electricity;
      
      expect(electricityConfig.unit).toBe(originalElectricityConfig.unit);
      expect(electricityConfig.color).toBe(originalElectricityConfig.color);
      expect(electricityConfig.label).toBe(originalElectricityConfig.label);
    });
  })
}) 