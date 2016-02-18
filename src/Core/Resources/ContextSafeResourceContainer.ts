import IDisposable from "../../Base/IDisposable";
import JThreeObjectWithID from "../../Base/JThreeObjectWithID";
import Canvas from "../Canvas/Canvas";
import {Action1} from "../../Base/Delegates";
import {AbstractClassMethodCalledException} from "../../Exceptions";
import CanvasListChangedEventArgs from "../Canvas/ICanvasListChangedEventArgs";
import ResourceWrapper from "./ResourceWrapper";
import JThreeContext from "../../JThreeContext";
import CanvasManager from "../Canvas/CanvasManager";
import ContextComponents from "../../ContextComponents";
/**
 * Provides context difference abstraction.
 */
class ContextSafeResourceContainer<T extends ResourceWrapper> extends JThreeObjectWithID implements IDisposable {

  public name: string;

  private childWrapper: { [key: string]: T } = {};

  private wrapperLength: number = 0;

  constructor() {
    super();
    const canvasManager = JThreeContext.getContextComponent<CanvasManager>(ContextComponents.CanvasManager);
    // Initialize resources for the renderers already subscribed.
    canvasManager.canvasListChanged.addListener(this.rendererChanged.bind(this));
  }

  public dispose() {
    this.each((e) => {
      e.dispose();
    });
  }

  public get wrappers(): T[] {
    const array = new Array(this.wrapperLength);
    let index = 0;
    this.each((elem) => {
      array[index] = elem;
      index++;
    });
    return array;
  }

  public getForContext(canvas: Canvas): T {
    return this.getForContextID(canvas.ID);
  }

  public getForContextID(id: string): T {
    if (!this.childWrapper[id]) {
      console.log("There is no matching object with the ID:" + id);
    }
    return this.childWrapper[id];
  }

  public each(act: Action1<T>): void {
    for (let key in this.childWrapper) {
      act(this.childWrapper[key]);
    }
  }

  protected createWrapperForCanvas(canvas: Canvas): T {
    throw new AbstractClassMethodCalledException();
  }

  protected initializeForFirst() {
    const canvasManager = JThreeContext.getContextComponent<CanvasManager>(ContextComponents.CanvasManager);
    canvasManager.canvases.forEach((v) => {
      this.childWrapper[v.ID] = this.createWrapperForCanvas(v);
      this.wrapperLength++;
    });
  }

  private rendererChanged(object: any, arg: CanvasListChangedEventArgs): void {
    if (arg.isAdditionalChange) {
      this.childWrapper[arg.canvas.ID] = this.createWrapperForCanvas(arg.canvas);
      this.wrapperLength++;
    } else { // TODO should be tested
      const delTarget: T = this.childWrapper[arg.canvas.ID];
      delete this.childWrapper[arg.canvas.ID];
      delTarget.dispose();
      this.wrapperLength--;
    }
  }

}

export default ContextSafeResourceContainer;
