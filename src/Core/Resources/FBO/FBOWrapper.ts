import Canvas from "../../Canvas/Canvas";
import ResourceWrapper from "../ResourceWrapper";
import TextureBase from "../Texture/TextureBase";
import RBO from "../RBO/RBO";
class FBOWrapper extends ResourceWrapper {

  private targetFBO: WebGLFramebuffer;

  private textures: TextureBase[] = [];

  constructor(canvas: Canvas) {
    super(canvas);
  }

  public get TargetShader(): WebGLShader {
    if (!this.Initialized) { this.init(); }
    return this.targetFBO;
  }

  public init(): void {
    if (!this.Initialized) {
      this.targetFBO = this.GL.createFramebuffer();
      this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.targetFBO);
      this.setInitialized();
    }
  }

  public bind() {
    if (!this.Initialized) { this.init(); }
    this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.targetFBO);
  }

  public unbind() {
    this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, null);
    /*        this.textures.forEach(tex=> {
                tex.getForContext(this.OwnerCanvas).bind();
                tex.generateMipmapIfNeed();
            });*/
  }

  public attachTexture(attachmentType: number, tex: TextureBase) {
    if (!this.Initialized) {
      this.init();
    }
    this.bind();
    if (tex == null) {
      this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, attachmentType, this.GL.TEXTURE_2D, null, 0);
      return;
    }
    let wt = tex.getForContext(this.OwnerCanvas);
    wt.preTextureUpload();
    this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, attachmentType, this.GL.TEXTURE_2D, wt.TargetTexture, 0);
    tex.getForContext(this.OwnerCanvas).bind();
    tex.generateMipmapIfNeed();
    if (this.textures.indexOf(tex) !== -1) {
      this.textures.push(tex);
    }
    this.GL.bindTexture(tex.TargetTextureType, null);
  }

  public attachRBO(attachmentType: number, rbo: RBO) {
    if (!this.Initialized) {
      this.init();
    }
    this.bind();
    if (rbo == null) {
      this.GL.framebufferRenderbuffer(this.GL.FRAMEBUFFER, attachmentType, this.GL.RENDERBUFFER, null);
      return;
    }
    let wrapper = rbo.getForContext(this.OwnerCanvas);
    this.GL.framebufferRenderbuffer(this.GL.FRAMEBUFFER, attachmentType, this.GL.RENDERBUFFER, wrapper.Target);
  }

  public dispose() {
    if (this.Initialized) {
      this.GL.deleteFramebuffer(this.targetFBO);
      this.targetFBO = null;
      this.setInitialized(false);
    }
  }
}

export default FBOWrapper;
