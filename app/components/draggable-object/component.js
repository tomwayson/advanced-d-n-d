import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNames:['draggable'],
  attributeBindings:['draggable'],
  draggable:true,
  dragType: 'add',
  objectType: 'card',
  action:'add-card',
  dragImageOffsetX: 0,
  dragImageOffsetY: 0,
  layoutCoordinator: Ember.inject.service('layout-coordinator'),

  dragStart(e){
    const dragType = this.get('dragType');
    const objectType = this.get('objectType');
    const dragImage = this.get('dragImage');

    // TODO: send an onBeforeDragStart action
    // so callers can modify transferData before dragging?

    console.log('DRAGGABLE-OBJECT Start for  ' + objectType);
    // set the drag properties on the event bus
    this.set('layoutCoordinator.transferData', {
      dragType: dragType,
      objectType: objectType,
      // default action based on drag/object type
      action: dragType + '-' + objectType,
      model: this.get('model')
    });

    //this is literally needed because "firefox"
    e.dataTransfer.setData('foo/custom','so firefox works');
    // set drag image?
    if (dragImage && e.dataTransfer && e.dataTransfer.setDragImage) {
      e.dataTransfer.setDragImage(dragImage, this.get('dragImageOffsetX'), this.get('dragImageOffsetY'));
    }

    // let parent know that we've started dragging
    this.sendAction('onDragStart');
  }
});
