import "@testing-library/jest-dom";
import ReactDOM from "react-dom";

// Polyfill for findDOMNode removed in React 19
// This is a temporary workaround for react-select v1 which uses findDOMNode
// TODO: Remove this polyfill after upgrading react-select to v5+
ReactDOM.findDOMNode = function(instance) {
  if (instance == null) {
    return null;
  }
  
  // If it's a DOM element, return it
  if (instance.nodeType === 1) {
    return instance;
  }
  
  // For React components, try to get the underlying DOM node
  if (instance._reactInternals) {
    const fiber = instance._reactInternals;
    let node = fiber;
    
    // Walk up the fiber tree to find a host component (DOM node)
    while (node) {
      if (node.stateNode && node.stateNode.nodeType === 1) {
        return node.stateNode;
      }
      node = node.child;
    }
  }
  
  // Fallback: return null
  return null;
};

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
