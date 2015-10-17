import Quaternion = require("../../Math/Quaternion");
import Vector3 = require("../../Math/Vector3");
import Matrix = require("../../Math/Matrix");
import SceneObject = require("../SceneObject");
import JThreeObject = require("../../Base/JThreeObject");
import Delegates = require("../../Base/Delegates");
import glm = require("gl-matrix");
import RendererBase = require("./../Renderers/RendererBase");
import JThreeEvent = require("./../../Base/JThreeEvent");
import Vector4 = require("../../Math/Vector4");
/**
 * Position,rotation and scale of scene object.
 * Every scene object in a scene has Toransformer.It's used to store and manipulate the position,rotation and scale ob the object.
 * Every Transformer can have a parent, each parent Transformer affect children's Transformer hierachically.
 */
class Transformer extends JThreeObject
{
    /**
     * Constructor of Transformer
     * @param sceneObj the scene object this transformer attached to.
     */
    constructor(sceneObj: SceneObject)
    {
        super();
        this.linkedObject = sceneObj;
        this.position = Vector3.Zero;
        this.rotation = Quaternion.Identity;
        this.scale = new Vector3(1, 1, 1);
        this.localOrigin = new Vector3(0, 0, 0);
        this.updateTransform();
    }

    public get hasParent()
    {
      return !!this.linkedObject.Parent;
    }

    public get parent()
    {
      return this.hasParent?this.linkedObject.Parent.Transformer:null;
    }

    public get childrenCount()
    {
      return this.linkedObject.Children.length;
    }

    public hasChanged:boolean=false;

    /**
     * Scene oject reference this transformer related to.
     */
    private linkedObject: SceneObject;

    /**
     * backing field of Rotation.
     */
    private rotation: Quaternion;

    /**
     * backing field of Position.
     */
    private position: Vector3;

    private localOrigin: Vector3;

    /**
     * backing field of Scale.
     */
    private scale: Vector3;

    /**
     * forward direction of transform in world space
     */
     public forward: Vector3=Vector3.ZUnit.negateThis();

     /**
     * up direction of transform in world space
     */
     public up:Vector3=Vector3.YUnit;

     /**
     * right direction of transform in world space
     */
     public right:Vector3=Vector3.XUnit;

    /**
     * backing field of LocalTransform.
     */
    private localTransform: Matrix;

    /**
     * backing field of LocalToGlobal
     */
    private localToGlobal: Matrix;

    /**
     * calculation cache
     */
    private localTransformCache: glm.GLM.IArray = glm.mat4.create();

    private localToGlobalCache: glm.GLM.IArray = glm.mat4.create();

    private modelViewProjectionCaluculationCache = glm.mat4.create();

    private cacheVec: glm.GLM.IArray = glm.vec4.create();

    private globalToLocalCache:Matrix = Matrix.identity();

    private g2lupdated:boolean =false;

    public get globalToLocal()
    {
      if(this.g2lupdated)
      {
        return this.globalToLocalCache;
      }
      glm.mat4.invert(this.globalToLocalCache.rawElements,this.localToGlobalCache);
      this.g2lupdated = true;
    }

    /**
     * properties for storeing event handlers
     */
    private onUpdateTransformHandler: JThreeEvent<SceneObject> = new JThreeEvent<SceneObject>();

    /**
     * Subscribe event handlers it will be called when this transformer's transform was changed.
     * @param action the event handler for this event.
     */
    public onUpdateTransform(action: Delegates.Action2<Transformer, SceneObject>): void
    {
        this.onUpdateTransformHandler.addListener(action);
    }

    /**
     * update all transform
     * You no need to call this method manually if you access all of properties in this transformer by accessor.
     */
    public updateTransform(): void
    {
        this.hasChanged =true;
        //initialize localTransformCache & localToGlobalCache
        glm.mat4.identity(this.localTransformCache);
        glm.mat4.identity(this.localToGlobalCache);
        glm.mat4.fromRotationTranslationScaleOrigin(this.localTransformCache, this.rotation.rawElements, this.position.rawElements, this.Scale.rawElements, this.localOrigin.rawElements);//substitute Rotation*Translation*Scale matrix (around local origin) for localTransformCache
        this.localTransform = new Matrix(this.localTransformCache);//Generate Matrix instance and substitute the matrix for localTransform
        if (this.linkedObject != null && this.linkedObject.Parent != null) {
            //Use LocalToGlobal matrix of parents to multiply with localTransformCache
            glm.mat4.copy(this.localToGlobalCache, this.linkedObject.Parent.Transformer.LocalToGlobal.rawElements);
        } else
        {
            //If this transformer have no parent transformer,localToGlobalCache,GlobalTransform will be same as localTransformCache
            glm.mat4.identity(this.localToGlobalCache);
        }
        //Multiply parent transform
        this.localToGlobal = new Matrix(glm.mat4.multiply(this.localToGlobalCache, this.localToGlobalCache, this.localTransform.rawElements));
        //Calculate direction vectors
        this.updateDirection(this.right,[1,0,0,0]);
        this.updateDirection(this.up,[0,1,0,0]);
        this.updateDirection(this.forward,[0,0,-1,0]);
        //notify update to childrens
        if (this.linkedObject.Children) this.linkedObject.Children.each((v) =>
        {
            v.Transformer.updateTransform();
        });
        this.g2lupdated = false;
        //fire updated event
        this.onUpdateTransformHandler.fire(this, this.linkedObject);
    }

    private updateDirection(rawElements:Vector3,sourceVector4:number[])
    {
      glm.vec4.transformMat4(rawElements.rawElements,sourceVector4,this.localToGlobalCache);
      glm.vec3.normalize(rawElements.rawElements,rawElements.rawElements)
    }

    /**
     * Calculate Projection-View-Model matrix with renderer camera.
     */
    public calculateMVPMatrix(renderer: RendererBase): Matrix
    {
        glm.mat4.mul(this.modelViewProjectionCaluculationCache, renderer.Camera.viewMatrix.rawElements, this.LocalToGlobal.rawElements);
        glm.mat4.mul(this.modelViewProjectionCaluculationCache, renderer.Camera.projectionMatrix.rawElements, this.modelViewProjectionCaluculationCache);
        return new Matrix(this.modelViewProjectionCaluculationCache);
    }

    public get GlobalPosition()
    {
      return Matrix.transformPoint(this.localToGlobal,Vector3.Zero);
    }

    /**
     * Get accessor for the matrix providing the transform Local space into Global space.
     */
    public get LocalToGlobal(): Matrix
    {
        return this.localToGlobal;
    }

    public get LocalTransform(): Matrix {
        return this.localTransform;
    }
    /**
     * Get accessor for model rotation.
     */
    public get Rotation(): Quaternion
    {
        return this.rotation;
    }
    /**
     * Set accessor for model rotation.
     */
    public set Rotation(quat: Quaternion)
    {
        this.rotation = quat;
        this.updateTransform();
    }
    /**
     * Get Accessor for model position.
     */
    public get Position(): Vector3
    {
        return this.position;
    }
    /**
     * Set Accessor for model position.
     */
    public set Position(vec: Vector3)
    {
        this.position = vec;
        this.updateTransform();
    }

    /**
     * Get Accessor for model scale.
     */
    public get Scale(): Vector3
    {
        return this.scale;
    }

    /**
     * Set Accessor for model scale.
     */
    public set Scale(vec: Vector3)
    {
        this.scale = vec;
        this.updateTransform();
    }

    public get LocalOrigin(): Vector3
    {
        return this.localOrigin;
    }

    public set LocalOrigin(origin: Vector3)
    {
        this.localOrigin = origin;
        this.updateTransform();
    }

    public transformDirection(direction:Vector3)
    {
      return Matrix.transformNormal(this.LocalToGlobal,direction);
    }

    public transformPoint(point:Vector3)
    {
      return Matrix.transformPoint(this.localToGlobal,point);
    }

    public transformVector(vector:Vector4)
    {
      return Matrix.transform(this.localToGlobal,vector);
    }

    public inverseTransformDirection(direction:Vector3)
    {
      return Matrix.transformNormal(this.globalToLocal,direction);
    }

    public inverseTransformPoint(point:Vector3)
    {
      return Matrix.transformPoint(this.globalToLocal,point);
    }

    public inverseTransformVector(vector:Vector4)
    {
      return Matrix.transform(this.globalToLocal,vector);
    }
}

export =Transformer;
