import GomlTreeNodeBase from "../../Goml/GomlTreeNodeBase";
import J3Object from "../J3Object";

class Filter {
  public static filter(filter: GomlTreeNodeBase[], selector: string, context?: GomlTreeNodeBase): GomlTreeNodeBase[] {
    const found_nodes = J3Object.find(selector, context);
    return found_nodes.filter((node) => {
      return filter.indexOf(node) !== -1;
    });
  }
}

export default Filter;
