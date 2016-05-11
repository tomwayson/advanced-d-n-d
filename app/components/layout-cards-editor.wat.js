import Ember from 'ember';

export default Ember.Component.extend({

  cards:null,
  canvasPosition: null,
  canvasClassName: null,

  /**
   * Get the event bus
   */
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  /**
   * Add handlers
   */
  listen: function(){
    this.get('layoutCoordinator').on('addCard', this, 'addCard');
    this.get('layoutCoordinator').on('serialize', this, 'serialize');
  }.on('init'),
  /**
   * Remove handlers
   */
  cleanup: function(){
    this.get('layoutCoordinator').off('addCard', this, 'addCard');
    this.get('layoutCoordinator').off('serialize', this, 'serialize');
  }.on('willDestroyElement'),


  /**
   * Initialize the card-canvas component
   */
  init(){
    this._super(...arguments);
    //create a randomId
    this.set('canvasClassName', 'card-canvas-' + (Math.random() * 10000).toFixed(0));
    let sheet = this.createStylesheet(this.get('canvasClassName'));
    this.set('stylesheet', sheet);
    this.COLUMNS = 12;
    this.ROWS = 0;
    this.HEIGHT  = 0;
    this.HPADDING = 20;
    this.VPADDING = 20;
    this.VMARGIN = 20;
    this.CELLHEIGHT= 60;
  },

  didInsertElement(){
    //this will then be used to target the inlined
    this.set('canvasPosition',this.$().position);
    //kicl things off
    this.updateStyles(this.ROWS + 10);
    this.updateCanvasHeight();
  },

  /**
   * Update the height of the Canvas
   */
  updateCanvasHeight() {
    var gridHeight =this.getGridHeight();
    let newHeight = gridHeight* (this.CELLHEIGHT + this.VMARGIN) - this.VMARGIN;
    //set the height on the card-canvas (the container for cards )
    this.$('.card-canvas').height(newHeight);
    //ensure we have all the y styles for this height
    this.updateStyles(gridHeight);
  },

  /**
   * Based on the cards, get the total height
   * @return {number} Grid height in CELLS
   */
  getGridHeight() {
    return _.reduce(this.get('cards'), function(memo, c) { return Math.max(memo, c.y + c.height); }, 0);
  },

  /**
   * Update the inlined styles that handle the heights
   * l:551
   */
  updateStyles: function(maxHeight){

    if (typeof maxHeight === 'undefined') {
      maxHeight = 0;
      this.updateCanvasHeight();
    }
    let prefix = '.card-editor';
    if(this.ROWS === 0){
      this.insertCssRule( prefix,'min-height: ' + (this.CELLHEIGHT) + 'px;', 0);
    }

    if(maxHeight > this.ROWS){
      for(var i = this.ROWS; i < maxHeight; i++){
        //insert rules for this 'ROW'
        this.insertCssRule(
            prefix + '[data-gs-height="' + (i + 1) + '"]',
            'height: ' + (this.CELLHEIGHT * (i + 1) + this.VMARGIN * i) + 'px;',
            i
        );
        this.insertCssRule(
            prefix + '[data-gs-min-height="' + (i + 1) + '"]',
            'min-height: ' + (this.CELLHEIGHT * (i + 1) + this.VMARGIN * i) + 'px;',
            i
        );
        this.insertCssRule(
            prefix + '[data-gs-max-height="' + (i + 1) + '"]',
            'max-height: ' + (this.CELLHEIGHT * (i + 1) + this.VMARGIN * i) + 'px;',
            i
        );
        this.insertCssRule(
            prefix + '[data-gs-y="' + i + '"]',
            'top: ' + (this.CELLHEIGHT * i + this.VMARGIN * i) + 'px;',
            i
        );
      }
      this.ROWS = maxHeight;
    }
  },

  /**
   * Add a stylesheet to the document
   * @param  {string} id Id of the stylesheet element
   */
  createStylesheet: function(id){
    //inject a style element in the header
    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-gs-id', id);
    if (style.stylesheet) {
      style.stylesheet.cssText = '';
    }
    else {
      style.appendChild(document.createTextNode(''));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
    return style.sheet;
  },

  /**
   * Remove a stylesheet from the document
   * @param  {string} id Id of the stylesheet to remvoe
   */
  removeStylesheet: function(id){
    this.$("STYLE[data-gs-id=" + id +"]").remove();
  },

  /**
   * Insert a rule into the stylesheet
   * @param  {string} selector selector as a string
   * @param  {string} rules    Css rules to addRule
   * @param  {number} index    Index at which to add the rule
   */
  insertCssRule: function(selector, rules, index){
    let sheet = this.get('stylesheet');
    if (typeof sheet.insertRule === 'function') {
      sheet.insertRule(selector + '{' + rules + '}', index);
    }
    else if (typeof sheet.addRule === 'function') {
      sheet.addRule(selector, rules, index);
    }
  },


  /**
   * Given a card, find any cars that intersect it,
   * and move them
   * @param  {[type]} card [description]
   * @return {[type]}      [description]
   */
  fixCollisions: function(card){
    let self = this;
    console.log('card-canvas:fixCollisions called for card at ' + card.x + ',' + card.y +',' + card.height + ',' + card.width);
    var sortedCards = this.sortCards(-1);
    // console.log('   Sorted Cards:');
    // sortedCards.forEach(function(card){
    //   console.log('       Card: x:' + card.x + ',y:' + card.y + ',h:' + card.height + ',w:'+card.width);
    // });


    var nn = {x:card.x, y:card.y, width:card.width, height:card.height, id:card.id + '-PLACEHOLDER'};

    //Run this until everything settles and there are no collisions
    while(true){

      var collisionCard = _.find(sortedCards, function(c){
        return c !== card && self.checkIntersection(c, nn);
      });

      if (typeof collisionCard === 'undefined') {
        console.log('card-canvas:fixCollisions - no collision found. Returning.');
        return;
      }
      console.log('card-canvas:fixCollisions - Collision found. Moving card...');
      self.moveCard(collisionCard, collisionCard.x, card.y + card.height, collisionCard.width, collisionCard.height, true);
    }
  },

  /**
   * Pack the cards upwards is space is available
   */
  packCards: function(){
    let self = this;
    console.log('card-canvas:packCards called...');
    var sortedCards = self.sortCards();
    _.each(sortedCards, function(n, i) {
        while (n.y > 0) {
            var new_y = n.y - 1;
            var can_be_moved = i === 0;

            if (i > 0) {
                var collision_node = _.chain(sortedCards)
                    .take(i)
                    .find(function(bn) {
                        return self.checkIntersection({x: n.x, y: new_y, width: n.width, height: n.height, id:'PACKCHECK'}, bn);
                    })
                    .value();
                can_be_moved = typeof collision_node === 'undefined';
            }

            if (!can_be_moved) {
                break;
            }
            n._dirty = n.y !== new_y;
            Ember.set(n, 'y', new_y);
        }
    }, this);
    self.updateCanvasHeight();
  },


  /**
   * Return an array of cards sorted either from top-left or the reverse
   */
  sortCards: function(dir){
    var cards = this.get('cards');
    //get the max valye of x + width
    var width = _.chain(cards).map(function(card) { return card.x + card.width; }).max().value();
    dir = dir !== -1 ? 1 : -1;
    return _.sortBy(cards, function(card) { return dir * (card.x + card.y * width); });
  },

  /**
   * Move a card to a new location
   * @param  {Card} card   Card to move
   * @param  {number} x      Column of the upper-right of card
   * @param  {number} y      Row of the upper-right of card
   * @param  {number} width  Width in Columns
   * @param  {number} height Height in Rows
   * @param  {boolean} noPack Should the other cards be packed
   * @return {Card} Card that was moved
   */
  moveCard: function( card, x, y, width, height, noPack){
    console.log('card-canvas:moveCard called for card x: ' + card.x + '=>' + x +', y:' + card.y + '=>' + card.y);
    if (typeof x !== 'number'){
       x = card.x;
    }
    if (typeof y !== 'number') {
      y = card.y;
    }
    if (typeof width !== 'number'){
      width = card.width;
    }
    if (typeof height !== 'number') {
      height = card.height;
    }
    if (typeof card.max_width !== 'undefined') {
      width = Math.min(width, card.max_width);
    }
    if (typeof card.max_height !== 'undefined') {
      height = Math.min(height, card.max_height);
    }
    if (typeof card.min_width !== 'undefined') {
      width = Math.max(width, card.min_width);
    }
    if (typeof card.min_height !== 'undefined') {
      height = Math.max(height, card.min_height);
    }

    if (card.x === x && card.y === y && card.width === width && card.height === height) {
        return card;
    }

    // var resizing = card.width !== width;

    Ember.set(card, 'x', x);
    Ember.set(card, 'y', y);
    Ember.set(card, 'height', height);
    Ember.set(card, 'width', width);
    //fix collisions...
    this.fixCollisions(card);
    //re-pack things
    if(!noPack){
      this.packCards();
    }


    return card;
  },

  /**
   * Check for intersection between two cards
   * @param  {Card} a card that moved
   * @param  {Card} b Card we are checking for intersection with
   * @return {Boolean}   Does card A intersection card b?
   */
  checkIntersection: function(a, b) {

    // console.log('--Intersection check between ' + a.id + ' and ' + b.id);
    // console.log('a.x:' + a.x + ' +  a.w:' + a.width + ' = ' + (parseInt(a.x) + parseInt(a.width)) + ' <= ' + b.x + ' res: ' + (parseInt(a.x) + parseInt(a.width) <= parseInt(b.x)));
    // console.log('b.x:' + b.x + ' +  b.w:' + b.width + ' = ' + (parseInt(b.x) + parseInt(b.width)) + ' <= ' + a.x + ' res: ' + (parseInt(b.x) + parseInt(b.width) <= parseInt(a.x)));
    // console.log('a.y:' + a.y + ' +  a.h:' + a.height + ' = ' + (parseInt(a.y) + parseInt(a.height)) + ' <= ' + b.y + ' res: ' + (parseInt(a.y) + parseInt(a.height) <= parseInt(b.y)));
    // console.log('b.y:' + b.y + ' +  b.h:' + b.height + ' = ' + (parseInt(b.y) + parseInt(b.height)) + ' <= ' + a.y + ' res: ' + (parseInt(b.y) + parseInt(b.height) <= parseInt(a.y)));

    //GAH EMBER! (Shakes fits at sky) the values of these properties are strings! So we need to parse-int them all!
    var res = !( (parseInt(a.x) + parseInt(a.width))  <= parseInt(b.x) ||
                parseInt(b.x) + parseInt(b.width)  <= parseInt(a.x) ||
                parseInt(a.y) + parseInt(a.height) <= parseInt(b.y) ||
                parseInt(b.y) + parseInt(b.height) <= parseInt(a.y) );
    // if(res){
    //     console.log('+++++ A and B do intersect.');
    // }else{
    //     console.log('----- A and B do not intersect.');
    // }

    return res;
  },



  /**
   * Add a new card to the canvas.
   * This will add a 4x6 card at the first available area,
   * extending the canvas is necessary
   */
  addCard(card) {
    let self = this;
    card = card || {
      "x": 0,"y": 0,"width": 6,"height": 4,
      "component": {
        "name":"placeholder-card"
      }
    };
    card.isNew = true;
    var sortedCards = this.sortCards();
    for (var i = 0;; ++i) {
        var x = i % this.COLUMNS,
            y = Math.floor(i / this.COLUMNS);
        if (x + card.width > this.COLUMNS) {
            continue;
        }
        if (!_.find(sortedCards, function(c) {
            return self.checkIntersection({x: x, y: y, width: card.width, height: card.height, id:'ADDTOKEN'}, c);
        })) {
            card.x = x;
            card.y = y;
            break;
        }
    }

    //inject into the cards array
    self.get('cards').pushObject(card);
    //ensure that canvas fits this new card...
    self.updateCanvasHeight();
    //mark the model as dirty
    this.get('layoutCoordinator').trigger('modelChanged');
  },

  /**
   * Ember Actions called from child components
   */
  actions: {

    onLayoutChangeStart: function(/*card*/){
      //show placeholder for this card
      this.updateCanvasHeight();
    },
    onLayoutChange: function(card){
      console.log('card-canvas:onLayoutChange ' + card.x + ', ' + card.y);
      this.updateCanvasHeight();
    },
    onLayoutChangeComplete: function(card){
      console.log('card-canvas:onLayoutChangeComplete ' + card.x + ', ' + card.y);
      //use the layoutCoordinator to notify upstream things that some model has changed
      this.get('layoutCoordinator').trigger('modelChanged');
      this.fixCollisions(card);
      this.packCards();
      this.updateCanvasHeight();
    },
    onCardRemove: function(card){
      console.log('card-canvas:onCardRemove ');
      this.get('layoutCoordinator').trigger('modelChanged');
      this.get('layoutCoordinator').trigger('modelChanged');
      this.set('cards', this.get('cards').without(card));
      this.packCards();
    },

  }

});
