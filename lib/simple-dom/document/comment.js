import Node from './node';

function Comment(text) {
  this.nodeConstructor(8, '#comment', text);
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;
Comment.prototype.nodeConstructor = Node;

export default Comment;