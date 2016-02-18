import BasicRegisterer from "./Registerer/BasicRegisterer";
import RegistererBase from "./Registerer/RegistererBase";
import StageDescriptionRegisterer from "./Registerer/StageDescriptionRegisterer";
import BasicMaterial from "./BasicMaterial";
import ShaderParser from "./ShaderParser";
import IContextComponent from "../../../IContextComponent";
import ContextComponents from "../../../ContextComponents";
import BufferRegisterer from "./Registerer/BufferRegisterer";
import TimeRegisterer from "./Registerer/TimeRegisterer";
import AsyncLoader from "../../Resources/AsyncLoader";
import Q from "q";
/**
 * A ContextComponent provides the feature to manage materials.
 * @type {[type]}
 */
class MaterialManager implements IContextComponent {

  private _uniformRegisters: { [key: string]: new () => RegistererBase } = {};

  private _materialDocuments: { [key: string]: string } = {};

  private _chunkLoader: AsyncLoader<string> = new AsyncLoader<string>();

  constructor() {
    this.addShaderChunk("jthree.builtin.vertex", require("../BuiltIn/Vertex/_BasicVertexTransform.glsl"));
    this.addShaderChunk("jthree.builtin.shadowfragment", require("../BuiltIn/ShadowMap/_ShadowMapFragment.glsl"));
    this.addShaderChunk("builtin.gbuffer-reader", require("../BuiltIn/Light/Chunk/_LightAccumulation.glsl"));
    this.addUniformRegister(BasicRegisterer);
    this.addUniformRegister(TimeRegisterer);
    // this.addUniformRegister(TextureRegister);
    this.addUniformRegister(BufferRegisterer);
    this.addUniformRegister(StageDescriptionRegisterer);
    this.registerMaterial(require("../BuiltIn/Materials/Phong.html"));
    this.registerMaterial(require("../BuiltIn/Materials/SolidColor.html"));
  }

  public getContextComponentIndex(): number {
    return ContextComponents.MaterialManager;
  }

  /**
   * Add shader chunk code to be stored.
   * @param {string} key shader chunk key
   * @param {string} val shader chunk code
   */
  public addShaderChunk(key: string, val: string): void {
    this._chunkLoader.pushLoaded(key, ShaderParser.parseInternalImport(val, this));
  }

  public loadChunks(srcs: string[]): Q.IPromise<string[]> {
    return Q.all(srcs.map(src => this._loadChunk(src)));
  }



  /**
   * Get shader chunk code from storage
   * @param  {string} key shader chunk key
   * @return {string}     stored shader chunk code
   */
  public getShaderChunk(key: string): string {
    return this._chunkLoader.fromCache(key);
  }

  public addUniformRegister(registerer: new () => RegistererBase) {
    this._uniformRegisters[registerer.prototype["getName"]() as string] = registerer;
  }

  public getUniformRegister(key: string): new () => RegistererBase {
    return this._uniformRegisters[key];
  }

  /**
   * Register material document(XMML) in material manager
   * @param {string} matDocument Raw xmml parsable string
   * @return {string}             material tag's name attribute
   */
  public registerMaterial(matDocument: string): string {
    const dom = (new DOMParser()).parseFromString(matDocument, "text/xml");
    const matTag = dom.querySelector("material");
    const matName = matTag.getAttribute("name");
    if (!matName) {
      console.error("Material name is required attribute,but name was not specified!");
    } else {
      this._materialDocuments[matName] = matDocument;
    }
    return matName;
  }
  /**
   * Construct BasicMaterial instance with registered xmml
   * @param  {string}        matName name of the xmml
   * @return {BasicMaterial}         [description]
   */
  public constructMaterial(matName: string): BasicMaterial {
    const matDoc = this._materialDocuments[matName];
    if (!matDoc) {
      // console.error(`Specified material name '${matName}' was not found!`);
      return undefined;
    } else {
      return new BasicMaterial(matDoc);
    }
  }

  private _loadChunk(src: string): Q.IPromise<string> {
    return this._chunkLoader.fetch(src, (absPath) => {
      const deferred = Q.defer<string>();
      const xhr = new XMLHttpRequest();
      xhr.open("GET", absPath, true);
      xhr.setRequestHeader("Accept", "text");
      xhr.onload = () => {
        this.loadChunks(ShaderParser.getImports(xhr.responseText));
        ShaderParser.parseImport(xhr.responseText, this).then((source) => {
          deferred.resolve(source);
        });
      };
      xhr.onerror = (err) => {
        deferred.reject(err);
      };
      xhr.send(null);
      return deferred.promise;
    });
  }
}

export default MaterialManager;
