import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['rows'],

  dragOver(event){
    //inform the DOM this is a drop target
    return false;
  },
  drop(event){
    console.log('bs-row-editor for ' + this.get('elementId') + ' caught drop');
    this.get('model.cards').pushObject({
      "width":4,
      "height": 4,
      "component": {"name": "placeholder-card"}
    });
  }



});
