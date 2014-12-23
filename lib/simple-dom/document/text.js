import Node from './node';

function Text(text) {
  this.nodeConstructor(3, '#text', text);
}

Text.prototype = Object.create(Node.prototype);
Text.prototype.constructor = Text;
Text.prototype.nodeConstructor = Node;

export default Text;