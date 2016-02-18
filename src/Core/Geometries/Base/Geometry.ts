import IVariableDescription from "../../Materials/Base/IVariableDescription";
import ProgramWrapper from "../../Resources/Program/ProgramWrapper";
import jThreeObject from "../../../Base/JThreeObject";
import Buffer from "./../../Resources/Buffer/Buffer";
import Canvas from "./../../Canvas/Canvas";
import Material from "./../../Materials/Material";
/**
 * Base abstraction for geometry.
 */
abstract class Geometry extends jThreeObject {
    public primitiveTopology: number = WebGLRenderingContext.TRIANGLES;
    public get GeometryOffset() {
        return 0;
    }

    public abstract drawElements(canvas: Canvas, material: Material);

    public abstract drawWireframe(canvas: Canvas, material: Material);

    public abstract applyAttributeVariables(pWrapper: ProgramWrapper, attributes: { [key: string]: IVariableDescription }): void;

    protected __assignAttributeIfExists(pWrapper: ProgramWrapper, attributes: { [key: string]: IVariableDescription }, valName: string, buffer: Buffer): void {
        if (attributes[valName]) {
            pWrapper.assignAttributeVariable(valName, buffer);
        }
    }

    public abstract getDrawLength(): number;

}
export default Geometry;
