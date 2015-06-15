import Node from './node';

function CDATASection(text) {
  this.nodeConstructor(4, "#cdata-section", text);
}

CDATASection.prototype = Object.create(Node.prototype);
CDATASection.prototype.constructor = CDATASection;
CDATASection.prototype.nodeConstructor = Node;

export default CDATASection;
