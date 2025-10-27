import { Container } from "components/Container.jsx";
import React from "react";
import { createRoot } from "react-dom/client";
import ControlRecordTreeBuilder from "src/helpers/ControlRecordTreeBuilder";
import ObservationMapper from "src/helpers/ObservationMapper";
import ScriptRunner from "src/helpers/scriptRunner";

// Store root instances for proper unmounting
const rootInstances = new Map();

window.renderWithControls = function renderWithControls(
  formDetails,
  observations,
  nodeId,
  collapse,
  patient,
  validateForm,
  locale,
  formTranslations,
) {
  const container = React.createElement(Container, {
    metadata: formDetails,
    observations,
    validate: true,
    validateForm,
    collapse,
    patient,
    locale,
    translations: formTranslations,
  });

  const domNode = document.getElementById(nodeId);
  if (!domNode) {
    console.error(`Element with id '${nodeId}' not found`);
    return null;
  }

  // Check if root already exists for this nodeId
  let root = rootInstances.get(nodeId);
  if (!root) {
    root = createRoot(domNode);
    rootInstances.set(nodeId, root);
  }

  root.render(container);
  return domNode;
};

window.unMountForm = (container) => {
  if (!container) return false;

  const nodeId = container.id;
  const root = rootInstances.get(nodeId);

  if (root) {
    root.unmount();
    rootInstances.delete(nodeId);
    return true;
  }

  return false;
};

window.getRecordTree = (formDef, observations) =>
  new ControlRecordTreeBuilder().build(formDef, observations);

window.runEventScript = (formData, eventScript, patient) =>
  new ScriptRunner(formData, patient).execute(eventScript);

window.getObservations = (records) => new ObservationMapper().from(records);
