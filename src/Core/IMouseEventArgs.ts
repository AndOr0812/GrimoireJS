import CanvasRegion from "./Canvas/CanvasRegion";
/**
 * The event args object interface to be used in mouse related event in CanvasRegion
 *
 * CanvasRegionクラスでのマウス関連イベントで使われるイベント引数のインターフェース
 */
interface IMouseEventArgs {
  /**
   * Whether the mouse pointer was entered the region by this event calling.
   *
   * このイベント呼び出しにより指定領域にマウスポインタが侵入したかどうか。
   * @type {boolean}
   */
  enter: boolean;

  /**
   * Whether the mouse pointer was leave the region by this event calling.
   *
   * このイベント呼び出しにより指定領域からマウスポインタが出たかどうか。
   * @type {boolean}
   */
  leave: boolean;

  /**
   * Whether the mouse pointer is on the region
   *
   * マウスポインタが指定領域内にあるかどうか
   * @type {boolean}
   */
  mouseOver: boolean;

  mouseX: number;

  mouseY: number;

  /**
   * The region this event rised
   *
   * このイベントを発火させたCanvasRegion
   * @type {CanvasRegion}
   */
  region: CanvasRegion;
}
export default IMouseEventArgs;
