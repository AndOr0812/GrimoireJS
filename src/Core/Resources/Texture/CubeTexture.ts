﻿import TextureBase from "./TextureBase";
import CubeTextureWrapper from "./CubeTextureWrapper";
import Canvas from "../../Canvas/Canvas";
type ImageSource = HTMLCanvasElement|HTMLImageElement|ImageData|ArrayBufferView;
class CubeTexture extends TextureBase {
  constructor(source: ImageSource[], textureName: string, flipY: boolean) {
    super(textureName, flipY, true);
    this.ImageSource = source;
  }

  private imageSource: ImageSource[] = null;

  public get ImageSource(): ImageSource[] {
    return this.imageSource;
  }

  public set ImageSource(img: ImageSource[]) {
    this.imageSource = img;
    this.each((v) => (<CubeTextureWrapper>v).init(true));
    this.generateMipmapIfNeed();
  }

  protected createWrapperForCanvas(canvas: Canvas): CubeTextureWrapper {
    const textureWrapper = new CubeTextureWrapper(canvas, this);
    return textureWrapper;
  }
}

export default CubeTexture;
