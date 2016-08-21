///<reference path="./gl-matrix.d.ts"/>
import GrimoireInterface from "./Core/GrimoireInterface";
import GomlLoader from "./Core/Node/GomlLoader";
/**
 * Provides procedures for initializing.
 */
class GrimoireInitializer {

  /**
   * Start initializing
   * @return {Promise<void>} The promise which will be resolved when all of the Goml script was loaded.
   */
  public static async initialize(): Promise<void> {
    GrimoireInitializer._copyGLConstants();
    await GrimoireInitializer._waitForDOMLoading();
    await GrimoireInterface.resolvePlugins();
    await GomlLoader.loadForPage();
  }

  /**
   * Ensure WebGLRenderingContext.[CONSTANTS] is exisiting.
   * Some of the browsers contains them in prototype.
   */
  private static _copyGLConstants(): void {
    if (WebGLRenderingContext.ONE) {
      // Assume the CONSTANTS are already in WebGLRenderingContext
      // Chrome,Firefox,IE,Edge...
      return;
    }
    // Otherwise like ""Safari""
    for (let propName in WebGLRenderingContext.prototype) {
      if (/^[A-Z]/.test(propName)) {
        const property = WebGLRenderingContext.prototype[propName];
        WebGLRenderingContext[propName] = property;
      }
    }
  }

  /**
   * Obtain the promise object which will be resolved when DOMContentLoaded event was rised.
   * @return {Promise<void>} the promise
   */
  private static _waitForDOMLoading(): Promise<void> {
    return new Promise<void>((resolve) => {
      window.addEventListener("DOMContentLoaded", () => {
        resolve();
      });
    });
  }
}

/**
 * Just start the process.
 */
GrimoireInitializer.initialize();
window["gr"] = GrimoireInterface;

export default GrimoireInterface;
