[Client] Received 68 objects for widget Smart.Comparatif_IPE_Elec.compareData1 object ids: 
Array(68) [ "14918173780203064", "14918173780203139", "14918173780203385", "14918173780203404", "14918173780203557", "14918173780203774", "14918173780203829", "14918173780204006", "14918173780204153", "14918173780204234", … ]
mxui.js:5:164803
10:07:20.848 [Client] [CompareData] 🔍 DIAGNOSTIC - État des sources de données 
Object { hasAssetsDataSource: true, assetsStatus: "available", assetsCount: 193, hasTimeSeriesDataSource: true, timeSeriesStatus: "available", timeSeriesCount: 68, hasTimestampAttr: true, hasValueAttr: true, hasTsAssetAssociation: true, selectedAssetsCount: 2, … }
​
assetsCount: 193
​
assetsStatus: "available"
​
endDate: Date Mon Sep 01 2025 01:59:59 GMT+0200 (Central European Summer Time)
​
energyTypeConfig: "Elec"
​
hasAssetsDataSource: true
​
hasTimeSeriesDataSource: true
​
hasTimestampAttr: true
​
hasTsAssetAssociation: true
​
hasValueAttr: true
​
selectedAssetsCount: 2
​
startDate: Date Fri Aug 01 2025 02:00:00 GMT+0200 (Central European Summer Time)
​
timeSeriesCount: 68
​
timeSeriesStatus: "available"
​
viewModeConfig: "ipe"
​
<prototype>: Object { … }
mxui.js:5:164803
10:07:20.849 [Client] [CompareData] 🗺️ État global des données: 
Object { selectedAssets: 2, assetsNames: (2) […], totalTimeSeriesPoints: 68, totalVariables: 1213, viewMode: "ipe", energyType: "Elec" }
​
assetsNames: Array [ "EDF", "GROUPE_FROID" ]
​
energyType: "Elec"
​
selectedAssets: 2
​
totalTimeSeriesPoints: 68
​
totalVariables: 1213
​
viewMode: "ipe"
​
<prototype>: Object { … }
mxui.js:5:164803
10:07:20.849 [Client] [CompareData] 📋 Traitement asset: EDF 
Object { id: "38843546789456118", primaryEnergyType: "Elec" }
​
id: "38843546789456118"
​
primaryEnergyType: "Elec"
​
<prototype>: Object { … }
mxui.js:5:164803
10:07:20.851 [Client] [CompareData] 🔍 Points temporels trouvés pour EDF: 
Object { count: 0, sampleIds: [] }
​
count: 0
​
sampleIds: Array []
​
<prototype>: Object { … }
mxui.js:5:164803
10:07:20.852 [Client] [CompareData] 📋 Traitement asset: GROUPE_FROID 
Object { id: "38843546789456336", primaryEnergyType: "Elec" }
​
id: "38843546789456336"
​
primaryEnergyType: "Elec"
​
<prototype>: Object { … }
mxui.js:5:164803
10:07:20.852 [Client] [CompareData] 🔍 Points temporels trouvés pour GROUPE_FROID: 
Object { count: 68, sampleIds: (3) […] }
​
count: 68
​
sampleIds: Array(3) [ "14918173780203064", "14918173780203139", "14918173780203385" ]
​
<prototype>: Object { … }
mxui.js:5:164803
10:07:20.852 [Client] [CompareData] Erreur lors du traitement des données Error: An ObjectItem can only be passed to a template that is linked to the same data source. (List reference "141.Smart.Comparatif_IPE_Elec.compareData1//tsVariableAssociation")
    r mxui.js:7
    a mxui.js:7
    d mxui.js:7
    d mxui.js:7
    filteredPoints CompareData.tsx:438
    CompareData CompareData.tsx:394
    CompareData CompareData.tsx:371
    rc mxui.js:31
    Sl mxui.js:31
    _l mxui.js:31
    _ mxui.js:61
    A mxui.js:61
    7463 mxui.js:61
    M mxui.js:66
    9982 mxui.js:61
    M mxui.js:66
    2551 mxui.js:31
    M mxui.js:66
    961 mxui.js:31
    M mxui.js:66
    5643 mxui.js:7
    M mxui.js:66
    <anonymous> mxui.js:66
    <anonymous> mxui.js:66
    Me mxui.js:5
    Me mxui.js:5
    e mxui.js:5
    Fe mxui.js:5
    $e mxui.js:5
    ce mxui.js:5
    p mxui.js:5
    <anonymous> mxui.js:5
mxui.js:5:164803
10:07:20.863 [Client] [LoadingService] Significant DOM changes detected