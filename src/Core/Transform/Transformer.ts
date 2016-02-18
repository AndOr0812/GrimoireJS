import Quaternion from "../../Math/Quaternion";
import Vector3 from "../../Math/Vector3";
import Matrix from "../../Math/Matrix";
import SceneObject from "../SceneObjects/SceneObject";
import JThreeObject from "../../Base/JThreeObject";
import {Action2} from "../../Base/Delegates";
import {mat4, vec3, vec4} from "gl-matrix";
import BasicRenderer from "./../Renderers/BasicRenderer";
import JThreeEvent from "./../../Base/JThreeEvent";
import Vector4 from "../../Math/Vector4";
/**
 * Position,rotation and scale of scene object.
 * Every scene object in a scene has Toransformer.It's used to store and manipulate the position,rotation and scale ob the object.
 * Every Transformer can have a parent, each parent Transformer affect children's Transformer hierachically.
 */
class Transformer extends JThreeObject {

  public hasChanged: boolean = false;

  /**
   * forward direction of transform in world space
   */
  public forward: Vector3 = Vector3.ZUnit.negateThis();

  /**
   * Scene oject reference this transformer related to.
   */
  public linkedObject: SceneObject;

  /**
  * up direction of transform in world space
  */
  public up: Vector3 = Vector3.YUnit;

  /**
  * right direction of transform in world space
  */
  public right: Vector3 = Vector3.XUnit;

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
   * calculation cache
   */
  private localTransformMatrix: Matrix = Matrix.identity();

  private localToGlobalMatrix: Matrix = Matrix.identity();

  private modelViewProjectionCaluculationCache = mat4.create();

  private globalToLocalCache: Matrix = Matrix.identity();

  private g2lupdated: boolean = false;

  /**
   * properties for storeing event handlers
   */
  private onUpdateTransformHandler: JThreeEvent<SceneObject> = new JThreeEvent<SceneObject>();


  /**
   * Constructor of Transformer
   * @param sceneObj the scene object this transformer attached to.
   */
  constructor(sceneObj: SceneObject) {
    super();
    this.linkedObject = sceneObj;
    this.position = Vector3.Zero;
    this.rotation = Quaternion.Identity;
    this.scale = new Vector3(1, 1, 1);
    this.localOrigin = new Vector3(0, 0, 0);
    this.updateTransform();
  }

  public get NeedUpdateChildren(): boolean {
    return true;
  }

  public get globalToLocal() {
    if (this.g2lupdated) {
      return this.globalToLocalCache;
    }
    mat4.invert(this.globalToLocalCache.rawElements, this.localToGlobalMatrix.rawElements);
    this.g2lupdated = true;
  }

  /**
   * Subscribe event handlers it will be called when this transformer's transform was changed.
   * @param action the event handler for this event.
   */
  public onUpdateTransform(action: Action2<Transformer, SceneObject>): void {
    this.onUpdateTransformHandler.addListener(action);
  }

  /**
   * update all transform
   * You no need to call this method manually if you access all of properties in this transformer by accessor.
   */
  public updateTransform(): void {
    this.hasChanged = true;
    this.updateTransformMatricies();
    // notify update to childrens
    if (this.linkedObject.Children && this.NeedUpdateChildren) {
    this.linkedObject.Children.forEach((v) => {
      v.Transformer.updateTransform();
    });
    }
    this.g2lupdated = false;
    // fire updated event
    this.onUpdateTransformHandler.fire(this, this.linkedObject);
  }

  public get hasParent() {
    return !!this.linkedObject.Parent;
  }

  public get parent() {
    return this.hasParent ? this.linkedObject.Parent.Transformer : null;
  }

  public get childrenCount() {
    return this.linkedObject.Children.length;
  }

  /**
   * Calculate Projection-View-Model matrix with renderer camera.
   */
  public calculateMVPMatrix(renderer: BasicRenderer): Matrix {
    mat4.mul(this.modelViewProjectionCaluculationCache, renderer.Camera.viewMatrix.rawElements, this.LocalToGlobal.rawElements);
    mat4.mul(this.modelViewProjectionCaluculationCache, renderer.Camera.projectionMatrix.rawElements, this.modelViewProjectionCaluculationCache);
    return new Matrix(this.modelViewProjectionCaluculationCache);
  }

  public get GlobalPosition() {
    return Matrix.transformPoint(this.localToGlobalMatrix, Vector3.Zero);
  }

  /**
   * Get accessor for the matrix providing the transform Local space into Global space.
   */
  public get LocalToGlobal(): Matrix {
    return this.localToGlobalMatrix;
  }

  public get LocalTransform(): Matrix {
    return this.localTransformMatrix;
  }
  /**
   * Get accessor for model rotation.
   */
  public get Rotation(): Quaternion {
    return this.rotation;
  }
  /**
   * Set accessor for model rotation.
   */
  public set Rotation(quat: Quaternion) {
    this.rotation = quat;
    this.updateTransform();
  }
  /**
   * Get Accessor for model position.
   */
  public get Position(): Vector3 {
    return this.position;
  }
  /**
   * Set Accessor for model position.
   */
  public set Position(vec: Vector3) {
    this.position = vec;
    this.updateTransform();
  }

  /**
   * Get Accessor for model scale.
   */
  public get Scale(): Vector3 {
    return this.scale;
  }

  /**
   * Set Accessor for model scale.
   */
  public set Scale(vec: Vector3) {
    this.scale = vec;
    this.updateTransform();
  }

  public get LocalOrigin(): Vector3 {
    return this.localOrigin;
  }

  public set LocalOrigin(origin: Vector3) {
    this.localOrigin = origin;
    this.updateTransform();
  }

  public transformDirection(direction: Vector3) {
    return Matrix.transformNormal(this.LocalToGlobal, direction);
  }

  public transformPoint(point: Vector3) {
    return Matrix.transformPoint(this.localToGlobalMatrix, point);
  }

  public transformVector(vector: Vector4) {
    return Matrix.transform(this.localToGlobalMatrix, vector);
  }

  public inverseTransformDirection(direction: Vector3) {
    return Matrix.transformNormal(this.globalToLocal, direction);
  }

  public inverseTransformPoint(point: Vector3) {
    return Matrix.transformPoint(this.globalToLocal, point);
  }

  public inverseTransformVector(vector: Vector4) {
    return Matrix.transform(this.globalToLocal, vector);
  }

  /**
  * Update transform matricies
  * @return {[type]} [description]
  */
  protected updateTransformMatricies() {
    // initialize localTransformCache & localToGlobalMatrix.rawElements
    mat4.identity(this.localTransformMatrix.rawElements);
    mat4.identity(this.localToGlobalMatrix.rawElements);
    // generate local transofrm matrix
    mat4.fromRotationTranslationScaleOrigin(this.localTransformMatrix.rawElements, this.rotation.rawElements, this.position.rawElements, this.scale.rawElements, this.localOrigin.rawElements); // substitute Rotation*Translation*Scale matrix (around local origin) for localTransformMatrix.rawElements
    if (this.linkedObject != null && this.linkedObject.Parent != null) {
      // Use LocalToGlobal matrix of parents to multiply with localTransformCache
      mat4.copy(this.localToGlobalMatrix.rawElements, this.linkedObject.Parent.Transformer.LocalToGlobal.rawElements);
    } else {
      // If this transformer have no parent transformer,localToGlobalMatrix.rawElements,GlobalTransform will be same as localTransformCache
      mat4.identity(this.localToGlobalMatrix.rawElements);
    }
    // Multiply parent transform
    mat4.multiply(this.localToGlobalMatrix.rawElements, this.localToGlobalMatrix.rawElements, this.localTransformMatrix.rawElements);
    this.updateDirections();
  }

  /**
   * Update directions by this transform
   */
  protected updateDirections() {
    // Calculate direction vectors
    this.updateDirection(this.right, [1, 0, 0, 0]); // need to reduce memory allocation
    this.updateDirection(this.up, [0, 1, 0, 0]);
    this.updateDirection(this.forward, [0, 0, -1, 0]);
  }

  private updateDirection(rawElements: Vector3, sourceVector4: number[]) {
    vec4.transformMat4(rawElements.rawElements, sourceVector4, this.localToGlobalMatrix.rawElements);
    vec3.normalize(rawElements.rawElements, rawElements.rawElements);
  }
}

export default Transformer;
