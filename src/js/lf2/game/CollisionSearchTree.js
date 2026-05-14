"use strict";

import { Rectangle } from './Rectangle.js';

class Node {
    /**
     * @param {Rectangle} value
     * @param {Node} parent
     * @param {CollisionSearchTree} tree
     */
    constructor(value, parent, tree) {
        this.value = new Rectangle(value);
        this.parent = parent || null;
        this.left = this.right = null;
        this.tree = tree;
    }

    add(value, parent) {
        const collisionResult = value.isIntersect(this.value);
        if (collisionResult && !this.isLeaf) {
            const leftRectAfterMerge = this.left !== null ? Rectangle.merge(this.left.value, value) : value;
            const rightRectAfterMerge = this.right !== null ? Rectangle.merge(this.right.value, value) : value;

            const leftAreaDiff = this.left !== null ? leftRectAfterMerge.area - this.left.area : leftRectAfterMerge.area;
            const rightAreaDiff = this.right !== null ? rightRectAfterMerge.area - this.right.area : rightRectAfterMerge.area;

            if (leftAreaDiff <= rightAreaDiff) {
                if (this.left === null) {
                    this.left = new Node(value, this, this.tree);
                    this._ReArrange(this.left);
                } else {
                    this.left.add(value, this.left);
                }
            } else {
                if (this.right === null) {
                    this.right = new Node(value, this, this.tree);
                    this._ReArrange(this.right);
                } else {
                    this.right.add(value, this.right);
                }
            }
        } else {
            const mergedRect = Rectangle.merge(value, this.value);
            let newNode = new Node(mergedRect, parent, this.tree);
            const valueNode = new Node(value, newNode, this.tree);
            const mostLeftNode = (this.value.position.x > valueNode.value.position.x) ? valueNode : this;
            const anotherNode = mostLeftNode === this ? valueNode : this;

            newNode.left = mostLeftNode;
            newNode.right = anotherNode;

            if (this.parent === null) {
                newNode.parent = null;
                this.tree.root = newNode;
            } else if (this.parent.left === this) {
                this.parent.left = newNode;
            } else {
                this.parent.right = newNode;
            }
            newNode.left.parent = newNode.right.parent = newNode;

            this._ReArrange(newNode);
        }
    }

    has(value) {
        if (value < this.value) {
            if (this.left) return this.left.has(value);
            else return false;
        } else if (value > this.value) {
            if (this.right) return this.right.has(value);
            else return false;
        } else if (value === this.value) {
            return true;
        }
    }

    get isLeaf() {
        return this.left === null && this.right === null;
    }

    *[Symbol.iterator]() {
        if (this.left) yield* this.left;
        yield this.value;
        if (this.right) yield* this.right;
    }

    _ReArrange(baseNode) {
        baseNode = baseNode.parent;
        const getRect = (node) => node ? node.value : null;
        while (baseNode) {
            let mergedRect = Rectangle.merge(getRect(baseNode.left), getRect(baseNode.right));
            console.log(mergedRect);
            baseNode.value = mergedRect;
            baseNode = baseNode.parent;
        }
    }
}

export class CollisionSearchTree {
    /** @param {Rectangle} value */
    add(value) {
        if (this.root) this.root.add(value, this.root);
        else this.root = new Node(value, null, this);
    }

    has(value) {
        if (this.root) return this.root.has(value);
        else return false;
    }

    *[Symbol.iterator]() {
        if (this.root) yield* this.root;
    }
}

lf2.CollisionSearchTree = CollisionSearchTree;
