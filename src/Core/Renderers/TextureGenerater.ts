import GeneraterInfoChunk from "./TextureGeneraters/GeneraterInfoChunk";
import BasicRenderer from "./BasicRenderer";
import GeneraterBase from "./TextureGeneraters/GeneraterBase";
import JThreeContext from "../../JThreeContext";
import ContextComponents from "../../ContextComponents";
import ResourceManager from "../ResourceManager";
import GeneraterList from "./TextureGeneraters/GeneraterList";

class TextureGenerater {

  private static generaters: { [key: string]: { [id: string]: GeneraterBase } } = {};

  public static generateTexture(renderer: BasicRenderer, generaterInfo: GeneraterInfoChunk) {
    const generaters = TextureGenerater.getGeneraters(renderer);
    const generater = generaters[generaterInfo.generater];
    generater.generate(generaterInfo);
    return TextureGenerater.getTexture(renderer, generaterInfo.name);
  }

  public static getTexture(renderer: BasicRenderer, bufferName: string) {
    return JThreeContext.getContextComponent<ResourceManager>(ContextComponents.ResourceManager).getTexture(renderer.ID + "." + bufferName);
  }

  private static getGeneraters(renderer: BasicRenderer) {
    if (TextureGenerater.generaters[renderer.ID]) { return TextureGenerater.generaters[renderer.ID]; }
    return TextureGenerater.initializeGeneraters(renderer);
  }

  private static initializeGeneraters(renderer: BasicRenderer) {
    const targetArray = <{ [key: string]: GeneraterBase }>{};
    const generaters = GeneraterList;
    for (let key in generaters) {
      if (generaters.hasOwnProperty(key)) {
        const element = generaters[key];
        targetArray[key] = new element(renderer);
      }
    }
    TextureGenerater.generaters[renderer.ID] = targetArray;
    return targetArray;
  }
}

export default TextureGenerater;
