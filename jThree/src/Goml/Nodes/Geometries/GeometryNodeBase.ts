import GomlTreeNodeBase = require("../../GomlTreeNodeBase");
import GomlLoader = require("../../GomlLoader");
import JThreeID = require("../../../Base/JThreeID");
import Geometry = require("../../../Core/Geometries/Geometry");
/**
* Base class for managing geometry node.
*/
class GomlTreeGeometryNode extends GomlTreeNodeBase
{
  constructor(elem: HTMLElement,loader:GomlLoader,parent:GomlTreeNodeBase)
  {
      super(elem,loader,parent);
  }

  private name:string;
  /**
  * GOML Attribute
  * Identical Name for geometry
  */
    public get Name():string{
    this.name=this.name||this.element.getAttribute('name')||JThreeID.getUniqueRandom(10);
    return this.name;
  }

  private lazy:boolean=undefined;
  /**
  * GOML Attribute
  * If this Attribute was true, this resource will be loaded when be used first.
  */
    public get Lazy():boolean
  {
    this.lazy=typeof this.lazy === 'undefined'?this.element.getAttribute('lazy').toLowerCase()=='true':this.lazy;
    return this.lazy;
  }

  private targetGeometry:Geometry;

/**
* The geometry this node managing.
*/
    public get TargetGeometry():Geometry
  {
    return this.targetGeometry;
  }
  /**
  * Generate geometry instance for the geometry.
  * You need to override this function to extend this class.
  */
  protected ConstructGeometry():Geometry
  {
    return null;
  }

    public beforeLoad():void
  {
    super.beforeLoad();
    this.targetGeometry=this.ConstructGeometry();
    this.loader.nodeRegister.addObject("jthree.geometries",this.Name,this);
  }
}
export=GomlTreeGeometryNode;