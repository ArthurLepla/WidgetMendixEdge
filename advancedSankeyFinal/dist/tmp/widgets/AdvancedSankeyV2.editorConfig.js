'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var react = require('react');
function getProperties(values, defaultProperties) {
  return defaultProperties;
}
function check(values) {
  var _a, _b;
  var errors = [];
  if (!values.hierarchyConfig || values.hierarchyConfig.length === 0) {
    errors.push({
      property: "hierarchyConfig",
      message: "Au moins un niveau hiérarchique doit être configuré."
    });
  }
  // Vérification des IDs uniques des niveaux
  var levelIds = new Set();
  (_a = values.hierarchyConfig) === null || _a === void 0 ? void 0 : _a.forEach(function (config) {
    if (levelIds.has(config.levelId)) {
      errors.push({
        property: "hierarchyConfig",
        message: "L'identifiant de niveau '".concat(config.levelId, "' est utilis\xE9 plusieurs fois. Les identifiants doivent \xEAtre uniques.")
      });
    }
    levelIds.add(config.levelId);
    // Vérification de l'entité du niveau
    if (!config.entityPath) {
      errors.push({
        property: "hierarchyConfig",
        message: "L'entit\xE9 source est requise pour le niveau '".concat(config.levelId, "'.")
      });
    }
    // Vérification de l'ordre des niveaux
    if (config.levelOrder === null || config.levelOrder < 0) {
      errors.push({
        property: "hierarchyConfig",
        message: "L'ordre du niveau '".concat(config.levelId, "' doit \xEAtre un nombre positif ou nul.")
      });
    }
  });
  // Vérification de l'ordre des niveaux
  var orders = ((_b = values.hierarchyConfig) === null || _b === void 0 ? void 0 : _b.map(function (config) {
    return config.levelOrder;
  })) || [];
  var uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    errors.push({
      property: "hierarchyConfig",
      message: "Chaque niveau doit avoir un ordre unique."
    });
  }
  return errors;
}
function getPreview(values, isDarkMode) {
  var _a;
  return react.createElement("div", {
    style: {
      border: "1px dashed #ccc",
      height: "400px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "14px",
      color: isDarkMode ? "#FFFFFF" : "#000000",
      backgroundColor: isDarkMode ? "#454545" : "#FFFFFF"
    }
  }, react.createElement("div", null, "Advanced Sankey Diagram Preview"), react.createElement("div", null, values.title || "Diagramme Sankey"), react.createElement("div", null, "".concat(((_a = values.hierarchyConfig) === null || _a === void 0 ? void 0 : _a.length) || 0, " niveau(x) configur\xE9(s)")));
}
function getCustomCaption(values) {
  return values.title || "Advanced Sankey Diagram";
}
exports.check = check;
exports.getCustomCaption = getCustomCaption;
exports.getPreview = getPreview;
exports.getProperties = getProperties;
