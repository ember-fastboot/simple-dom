import { SimpleChildNodes, SimpleNode } from '@simple-dom/interface';

export class ChildNodes implements SimpleChildNodes {
  constructor(private node: SimpleNode) {
  }

  public item(index: number): SimpleNode | null {
    let child = this.node.firstChild;

    for (let i = 0; child && index !== i; i++) {
      child = child.nextSibling;
    }

    return child;
  }
}
