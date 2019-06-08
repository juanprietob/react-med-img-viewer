import macro from 'vtk.js/Sources/macro';
import vtkInteractorStyleImage from 'vtk.js/Sources/Interaction/Style/InteractorStyleImage';
import vtkMath from 'vtk.js/Sources/Common/Core/Math';
import { States } from 'vtk.js/Sources/Rendering/Core/InteractorStyle/Constants';

// ----------------------------------------------------------------------------
// medImgInteractorStyleImage methods
// ----------------------------------------------------------------------------

function medImgInteractorStyleImage(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('medImgInteractorStyleImage');

  // Public API methods
  // const superHandleMouseMove = publicAPI.handleMouseMove;
  // publicAPI.handleMouseMove = (callData) => {
  //   superHandleMouseMove(callData);
  // };

  //----------------------------------------------------------------------------
  publicAPI.handleRightButtonPress = (callData) => {
    publicAPI.startDolly();
  };

  //--------------------------------------------------------------------------
  publicAPI.handleRightButtonRelease = () => {
    publicAPI.endDolly();
  };
  
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkInteractorStyleImage.extend(publicAPI, model, initialValues);

  // Create get-set macros
  macro.setGet(publicAPI, model, ['interactionMode']);

  // For more macro methods, see "Sources/macro.js"

  // Object specific methods
  medImgInteractorStyleImage(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'medImgInteractorStyleImage');

// ----------------------------------------------------------------------------

export default Object.assign({ newInstance, extend });
