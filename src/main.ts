import { loadFontsAsync, once, on, emit, showUI } from '@create-figma-plugin/utilities'

import { RunAppHandler, FirstNodeHandler, SelectTextNodeHandler } from './types'

export default function () {
  on<RunAppHandler>('RUN_APP', async function () {
    if (figma.currentPage.selection.length === 0) {
      console.log("No selection");
      figma.notify("Select a frame(s) to get started", { timeout: 2000 });
      return;
    } else {
      let nodes = figma.currentPage.selection;
      let firstNode = [];

      firstNode.push(figma.currentPage.selection[0]);

      const errors = lint(firstNode);

      emit<FirstNodeHandler>('FIRST_NODE', errors);

    }
  })
  on<SelectTextNodeHandler>('SELECT_TEXT_NODE', async function (node: TextNode) {
    figma.currentPage.selection = [node]
    figma.viewport.scrollAndZoomIntoView([node])
  })
  showUI({ height: 400, width: 320 })
}

function lint(nodes: any) {
  let errorArray: any = [];
  let childArray: any = [];

  nodes.forEach((node: any) => {

    // Create a new object.
    let newObject: any = {};

    // Give it the existing node id.
    newObject["id"] = node.id;

    let children = node.children;

    newObject["errors"] = determineType(node);

    if (!children) {
      errorArray.push(newObject);
      return;
    } else if (children) {
      // Recursively run this function to flatten out children and grandchildren nodes
      node["children"].forEach((childNode: any) => {
        childArray.push(childNode.id);
      });

      newObject["children"] = childArray;

      // If the layer is locked, pass the optional parameter to the recursive Lint
      // function to indicate this layer is locked.
      errorArray.push(...lint(node["children"]));
    }

    errorArray.push(newObject);
  });

  return errorArray;
}

function determineType(node: any) {
  if (node.type === "TEXT") {
    return lintTextRules(node);
  }
}


function lintTextRules(node: any) {
  let errors: any[] = [];
  checkType(node, errors);
  return errors;
}

function checkType(node: any, errors: any) {
  if (node.textStyleId === "" && node.visible === true) {
    let textObject = {
      font: "",
      fontStyle: "",
      fontSize: "",
      lineHeight: {}
    };

    let fontStyle = node.fontName;
    let fontSize = node.fontName;

    if (typeof fontSize === "symbol") {
      return errors.push(
        createErrorObject(
          node,
          "text",
          "Missing text style",
          "Mixed sizes or families"
        )
      );
    }

    if (typeof fontStyle === "symbol") {
      return errors.push(
        createErrorObject(
          node,
          "text",
          "Missing text style",
          "Mixed sizes or families"
        )
      );
    }

    textObject.font = node.fontName.family;
    textObject.fontStyle = node.fontName.style;
    textObject.fontSize = node.fontSize;

    // Line height can be "auto" or a pixel value
    if (node.lineHeight.value !== undefined) {
      textObject.lineHeight = node.lineHeight.value;
    } else {
      textObject.lineHeight = "Auto";
    }

    let currentStyle = `${textObject.font} ${textObject.fontStyle} / ${textObject.fontSize} (${textObject.lineHeight} line-height)`;

    return errors.push(
      createErrorObject(node, "text", "Missing text style", currentStyle)
    );
  } else {
    return;
  }
}

function createErrorObject(node: any, type: any, message: any, value?: any) {
  let error = {
    message: "",
    type: "",
    node: "",
    value: ""
  };

  error.message = message;
  error.type = type;
  error.node = node;

  if (value !== undefined) {
    error.value = value;
  }

  return error;
}