import Canvas from "../../Canvas/Canvas";
import BufferTexture from "./BufferTexture";
import TextureWrapperBase from "./TextureWrapperBase";
import {Func3} from "../../../Base/Delegates";
class BufferTextureWrapper extends TextureWrapperBase {
  constructor(ownerCanvas: Canvas, parent: BufferTexture) {
    super(ownerCanvas, parent);
  }

  public init() {
    if (this.Initialized) { return; }
    const parent = <BufferTexture>this.Parent;
    this.setTargetTexture(this.GL.createTexture());
    this.bind();
    this.GL.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, parent.TextureFormat, parent.Width, parent.Height, 0, parent.TextureFormat, parent.ElementFormat, null);
    this.setInitialized();
  }

  public unbind() {
    // TODO consider is it really need to implement unbind
    this.GL.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
  }

  public resize(width: number, height: number) {
    this.bind();
    if (this.Initialized) {
      const parent = <BufferTexture>this.Parent;
      this.preTextureUpload();
      this.GL.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, parent.TextureFormat, parent.Width, parent.Height, 0, parent.TextureFormat, parent.ElementFormat, null);
    }
  }

  public updateTexture(buffer: ArrayBufferView) {
    this.bind();
    if (this.Initialized) {
      const parent = <BufferTexture>this.Parent;
      this.preTextureUpload();
      this.GL.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, parent.TextureFormat, parent.Width, parent.Height, 0, parent.TextureFormat, parent.ElementFormat, buffer);
    }
    this.unbind();
  }

  public generateHtmlImage(encoder?: Func3<number, number, ArrayBufferView, Uint8Array>): HTMLImageElement {
    const parent = <BufferTexture>this.Parent;
    return this.encodeHtmlImage(parent.Width, parent.Height, encoder);
  }
}

export default BufferTextureWrapper;
