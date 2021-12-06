class Cart {
  constructor(source = 'getCart.json', container = '.cart', containerShoppingCart = '#shopping-cart') {
    this.source = source;
    this.container = container;
    this.countGoods = 0; //Общее кол-во товаров в корзине
    this.amount = 0; //Общая стоимость товаров в корзине
    this.cartItems = []; //Массив со всеми товарами
    this.containerShoppingCart = containerShoppingCart;
    this._init();
  }

  _render() {
    let $totalGoods = $(`<a href="checkout.html"><img src="img/cart.svg" alt="cart"><div class="cart-circle-five sum-goods"></div></a>`);
    let $cartItemsDiv = $('<form/>', {
      class: 'cart-items-wrap cart-box'
    });
    let $totalPrice = $(`
      <div class="total"><p>TOTAL</p><p class="sum-price"></p></div>
      <button class="cart-button-checkout href-checkout">CHECKOUT</button>
      <button class="cart-button-go-to-cart href-go-to-cart">GO TO CART</button>
`);
    $totalGoods.appendTo($(this.container));
    $cartItemsDiv.appendTo($(this.container));
    $totalPrice.appendTo($cartItemsDiv);
    // //jQ-UI Отлавливаем перемещаемый элемент в корзину и отправляем в this.addProduct():
    // $(this.container).droppable({
    //   drop: (event, ui) => {
    //     this.addProduct(ui.draggable.find('.buyBtn'));
    //   }
    // });
  }

  _init() {
    this._render();
    if (!localStorage.getItem('mycart')) {     //добавляем localStorage
      fetch(this.source)
        .then(result => result.json())
        .then(data => {
          for (let product of data.contents) {
            this.cartItems.push(product);
            this._renderItem(product);
          }
          this.countGoods = data.countGoods;
          this.amount = data.amount;
          localStorage.setItem('mycart', JSON.stringify(this.cartItems));
          localStorage.setItem('amount', JSON.stringify(this.amount));
          localStorage.setItem('countGoods', JSON.stringify(this.countGoods));
          this._renderSum();
        });
    } else {
      this.cartItems = JSON.parse(localStorage.getItem('mycart'));
      for (let product of this.cartItems) {
        this._renderItem(product)
      }
      this.amount = JSON.parse(localStorage.getItem('amount'));
      this.countGoods = JSON.parse(localStorage.getItem('countGoods'));
      this._renderSum();
    }

    this._renderShoppingCart();

    $('.href-checkout').click(event => {
      event.preventDefault();
      location.href = 'checkout.html';
    });
    $('.href-go-to-cart').click(event => {
      event.preventDefault();
      location.href = 'shopping-cart.html';
    });

    this._autocomplete();
    this._dragAndDrop();
  }

  _renderSum() {
    $('.sum-goods').text(`${this.countGoods}`);
    $('.sum-price').text(`${this.amount}$`);
  }

  _renderItem(product) {
    let $container = $('<div/>', {
      class: 'cart-item cart-flex',
      'data-product': product.id_product
    });
    let $reboxZane = $('<div/>', {
      class: 'rebox-zane',
    });
    let $removeElement = $(`<p><a class="icon-cancel-circled" href="#"></a></p>`);
    $reboxZane.append(`
      <p class="product-name">${product.product_name}</p>
      <p><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star-half-alt"></i></p>
      <p><span class="product-quantity">${product.quantity}</span><span> x </span><span>$${product.price}</span></p>
    `);
    $removeElement.appendTo($reboxZane);
    $container.append($(`
      <img class="cart-img" src="${product.img}" alt="${product.alt}">
`));
    $reboxZane.appendTo($container);
    $container.prependTo($('.cart-items-wrap'));
    this._remove(product, $removeElement, $container);
  }

  _updateCart(product) {
    let $container = $(`div[data-product="${product.id_product}"]`);
    $container.find('.product-quantity').text(product.quantity);
    $container.find('.product-price').text(`$${product.quantity * product.price}`);
  }

  addProduct(element) {
    let productId = +$(element).data('id');
    let find = this.cartItems.find(product => product.id_product === productId);
    if (find) {
      find.quantity++;
      this.countGoods++;
      this.amount += find.price;
      this._updateCart(find);
    } else {
      let product = {
        id_product: productId,
        img: $(element).data('img'),
        alt: $(element).data('alt'),
        price: +$(element).data('price'),
        product_name: $(element).data('name'),
        quantity: 1
      };
      this.cartItems.push(product);
      this.amount += product.price;
      this.countGoods++;
      this._renderItem(product);
    }
    localStorage.setItem('mycart', JSON.stringify(this.cartItems));  //Так же добавляем данные в localStorage
    localStorage.setItem('amount', JSON.stringify(this.amount));
    localStorage.setItem('countGoods', JSON.stringify(this.countGoods));
    this._renderSum();
  }

  _remove(product, $removeElement, $container, $subtotal, $quantity) {
    $removeElement.click(event => {
      event.preventDefault();
      if (product.quantity > 0) {
        product.quantity--;
        this._updateCart(product);
        this.countGoods--;
        this.amount -= product.price;
        this._renderSum();

        if (!product.quantity) {
          $container.remove();
          this.cartItems.splice(this.cartItems.indexOf(product), 1) //так же удаление по индексу из массива
        }

        if ($subtotal) {
          $subtotal.text(product.price * product.quantity);
          $quantity.children().val(product.quantity);
        }
        localStorage.setItem('mycart', JSON.stringify(this.cartItems));
        localStorage.setItem('amount', JSON.stringify(this.amount));
        localStorage.setItem('countGoods', JSON.stringify(this.countGoods));
      }
    })
  }

  _renderShoppingCart() {
    $(this.containerShoppingCart).append(`
      <div class="product-row">
          <div class="product-row-first"><p>PRODUCT DETAILS</p></div>
          <div class="product-row-other">
              <div><p>UNITE PRICE</p></div>
              <div><p>QUANTITY</p></div>
              <div><p>SHIPPING</p></div>
              <div><p>SUBTOTAL</p></div>
              <div><p>ACTION</p></div></div>
      </div>
    `);

    for (let product of this.cartItems) {
      let $container = $('<div/>', {
        class: 'product-row',
      });
      let $productRowFirst = (`
        <a href="product.html" class="product-row-first">
            <div><img class="shopping-cart-img" src="${product.img}" alt="${product.alt}"></div>
            <div>
                <div><p>${product.product_name}</p></div>
                <div><p><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star-half-alt"></i></p></div>
                <div><p>Color:</p><p>Red</p></div>
                <div><p>Size:</p><p>XII</p></div>
            </div>
        </a>
      `);
      let $productRowOther = $('<div/>', {
        class: 'product-row-other'
      });
      let $unitePrice = $(`<div><p>${product.price}</p></div>`);
      let $quantity = $(`<div><input type="number" value="${product.quantity}" min="1" max="999"></div>`);
      let $shipping = $(`<div><p>FREE</p></div>`);
      let $subtotal = $(`<div>${product.price * product.quantity}</div>`);
      let $action = $(`<div><p><a class="icon-cancel-circled" href="#"></a></p></div>`);

      $container.append($productRowFirst);
      $productRowOther.append($unitePrice);
      $productRowOther.append($quantity);
      $productRowOther.append($shipping);
      $productRowOther.append($subtotal);
      $productRowOther.append($action);
      $productRowOther.appendTo($container);
      $($container).appendTo(this.containerShoppingCart);

      this._remove(product, $action, $container, $subtotal, $quantity);
      this._quantity($quantity, product, $subtotal);
    }

    $(this.containerShoppingCart).append(`
      <div class="product-shopping-cart">
          <button class="clear-shopping-cart">CLEAR SHOPPING CART</button>
          <button class="href-checkout">CONTINUE SHOPPING</button>
      </div>
      <div class="product-shipping-total">
          <div>
              <p>SHIPPING ADRESS</p>
              <input id="product-shipping-adress" list="shipping-adress" placeholder="Bangladesh">
              <datalist id="shipping-adress">
                  <option label="Bangladesh" value="Bangladesh"></option>
                  <option label="France" value="France"></option>
                  <option label="Italia" value="Italia"></option>
                  <option label="South Korea" value="South Korea"></option>
                  <option label="USA" value="USA"></option>
                  <option label="Uzbekistan" value="Uzbekistan"></option>
                  <option label="Poland" value="Poland"></option>
                  <option label="China" value="China"></option>
                  <option label="Canada" value="Canada"></option>
              </datalist>
              <input type="text" placeholder="State">
              <input type="text" placeholder="Postcode/Zip">
              <button>GET A QUOTE</button>
          </div>
          <div>
              <p>COUPON DISCOUNT</p>
              <p>Enter your coupon code if you have one</p>
              <input type="text" placeholder="State">
              <button>APPLY COUPON</button>
          </div>
          <div>
              <p>SUB TOTAL</p><p class="sum-price">${this.amount}$</p>
              <p>GRAND TOTAL</p><p class="sum-price">${this.amount}$</p>
              <div></div>
             <button class="href-checkout">PROCEED TO CHECKOUT</button>
          </div>
      </div>
    `);
    $('.clear-shopping-cart').click(() => {
      $(this.containerShoppingCart).remove();
      $('.cart-items-wrap').remove();
      $('.sum-goods').text('0');
      localStorage.clear();
    });
  }

  _quantity($quantity, product, $subtotal){
    $quantity.on('click', 'input', event, () => {
      this._quantityUpdate($quantity, product, $subtotal)
    });
    $quantity.keyup(event, () => {
      this._quantityUpdate($quantity, product, $subtotal)
    })
  }

  _quantityUpdate($quantity, product, $subtotal){
    this.cartItems[this.cartItems.indexOf(product)].quantity = event.target.value;
    product.quantity = event.target.value;
    this.amount = 0;
    this.countGoods = 0;
    for (let item of this.cartItems) {
      this.amount += item.quantity * item.price;
      this.countGoods += +item.quantity;
    }
    $subtotal.text(product.price * product.quantity);
    this._updateCart(product);
    this._renderSum();

    localStorage.setItem('mycart', JSON.stringify(this.cartItems));  //Так же добавляем данные в localStorage
    localStorage.setItem('amount', JSON.stringify(this.amount));
    localStorage.setItem('countGoods', JSON.stringify(this.countGoods));
  }

  //jQuery UI
  _autocomplete(){
    let availableTags = ['a',
      'ability',
      'able',
      'about',
      'above',
      'accept',
      'according',
      'account',
      'across',
      'act',
      'action',
      'activity',
      'actually',
      'add',
      'address',
      'administration',
      'admit',
      'adult',
      'affect',
      'after',
      'again',
      'against',
      'age',
      'agency',
      'agent',
      'ago',
      'agree',
      'agreement',
      'ahead',
      'air',
      'all',
      'allow',
      'almost',
      'alone',
      'along',
      'already',
      'also',
      'although',
      'always',
      'American',
      'among',
      'amount',
      'analysis',
      'and',
      'animal',
      'another',
      'answer',
      'any',
      'anyone',
      'anything',
      'appear',
      'apply',
      'approach',
      'area',
      'argue',
      'arm',
      'around',
      'arrive',
      'art',
      'article',
      'artist',
      'as',
      'ask',
      'assume',
      'at',
      'attack',
      'attention',
      'attorney',
      'audience',
      'author',
      'authority',
      'available',
      'avoid',
      'away',
      'baby',
      'back',
      'bad',
      'bag',
      'ball',
      'bank',
      'bar',
      'base',
      'be',
      'beat',
      'beautiful',
      'because',
      'become',
      'bed',
      'before',
      'begin',
      'behavior',
      'behind',
      'believe',
      'benefit',
      'best',
      'better',
      'between',
      'beyond',
      'big',
      'bill',
      'billion',
      'bit',
      'black',
      'blood',
      'blue',
      'board',
      'body',
      'book',
      'born',
      'both',
      'box',
      'boy',
      'break',
      'bring',
      'brother',
      'budget',
      'build',
      'building',
      'business',
      'but',
      'buy',
      'by',
      'call',
      'camera',
      'campaign',
      'can',
      'cancer',
      'candidate',
      'capital',
      'car',
      'card',
      'care',
      'career',
      'carry',
      'case',
      'catch',
      'cause',
      'cell',
      'center',
      'central',
      'century',
      'certain',
      'certainly',
      'chair',
      'challenge',
      'chance',
      'change',
      'character',
      'charge',
      'check',
      'child',
      'choice',
      'choose',
      'church',
      'citizen',
      'city',
      'civil',
      'claim',
      'class',
      'clear',
      'clearly',
      'close',
      'coach',
      'cold',
      'collection',
      'college',
      'color',
      'come',
      'commercial',
      'common',
      'community',
      'company',
      'compare',
      'computer',
      'concern',
      'condition',
      'conference',
      'Congress',
      'consider',
      'consumer',
      'contain',
      'continue',
      'control',
      'cost',
      'could',
      'country',
      'couple',
      'course',
      'court',
      'cover',
      'create',
      'crime',
      'cultural',
      'culture',
      'cup',
      'current',
      'customer',
      'cut',
      'dark',
      'data',
      'daughter',
      'day',
      'dead',
      'deal',
      'death',
      'debate',
      'decade',
      'decide',
      'decision',
      'deep',
      'defense',
      'degree',
      'Democrat',
      'democratic',
      'describe',
      'design',
      'despite',
      'detail',
      'determine',
      'develop',
      'development',
      'die',
      'difference',
      'different',
      'difficult',
      'dinner',
      'direction',
      'director',
      'discover',
      'discuss',
      'discussion',
      'disease',
      'do',
      'doctor',
      'dog',
      'door',
      'down',
      'draw',
      'dream',
      'drive',
      'drop',
      'drug',
      'during',
      'each',
      'early',
      'east',
      'easy',
      'eat',
      'economic',
      'economy',
      'edge',
      'education',
      'effect',
      'effort',
      'eight',
      'either',
      'election',
      'else',
      'employee',
      'end',
      'energy',
      'enjoy',
      'enough',
      'enter',
      'entire',
      'environment',
      'environmental',
      'especially',
      'establish',
      'even',
      'evening',
      'event',
      'ever',
      'every',
      'everybody',
      'everyone',
      'everything',
      'evidence',
      'exactly',
      'example',
      'executive',
      'exist',
      'expect',
      'experience',
      'expert',
      'explain',
      'eye',
      'face',
      'fact',
      'factor',
      'fail',
      'fall',
      'family',
      'far',
      'fast',
      'father',
      'fear',
      'federal',
      'feel',
      'feeling',
      'few',
      'field',
      'fight',
      'figure',
      'fill',
      'film',
      'final',
      'finally',
      'financial',
      'find',
      'fine',
      'finger',
      'finish',
      'fire',
      'firm',
      'first',
      'fish',
      'five',
      'floor',
      'fly',
      'focus',
      'follow',
      'food',
      'foot',
      'for',
      'force',
      'foreign',
      'forget',
      'form',
      'former',
      'forward',
      'four',
      'free',
      'friend',
      'from',
      'front',
      'full',
      'fund',
      'future',
      'game',
      'garden',
      'gas',
      'general',
      'generation',
      'get',
      'girl',
      'give',
      'glass',
      'go',
      'goal',
      'good',
      'government',
      'great',
      'green',
      'ground',
      'group',
      'grow',
      'growth',
      'guess',
      'gun',
      'guy',
      'hair',
      'half',
      'hand',
      'hang',
      'happen',
      'happy',
      'hard',
      'have',
      'he',
      'head',
      'health',
      'hear',
      'heart',
      'heat',
      'heavy',
      'help',
      'her',
      'here',
      'herself',
      'high',
      'him',
      'himself',
      'his',
      'history',
      'hit',
      'hold',
      'home',
      'hope',
      'hospital',
      'hot',
      'hotel',
      'hour',
      'house',
      'how',
      'however',
      'huge',
      'human',
      'hundred',
      'husband',
      'I',
      'idea',
      'identify',
      'if',
      'image',
      'imagine',
      'impact',
      'important',
      'improve',
      'in',
      'include',
      'including',
      'increase',
      'indeed',
      'indicate',
      'individual',
      'industry',
      'information',
      'inside',
      'instead',
      'institution',
      'interest',
      'interesting',
      'international',
      'interview',
      'into',
      'investment',
      'involve',
      'issue',
      'it',
      'item',
      'its',
      'itself',
      'job',
      'join',
      'just',
      'keep',
      'key',
      'kid',
      'kill',
      'kind',
      'kitchen',
      'know',
      'knowledge',
      'land',
      'language',
      'large',
      'last',
      'late',
      'later',
      'laugh',
      'law',
      'lawyer',
      'lay',
      'lead',
      'leader',
      'learn',
      'least',
      'leave',
      'left',
      'leg',
      'legal',
      'less',
      'let',
      'letter',
      'level',
      'lie',
      'life',
      'light',
      'like',
      'likely',
      'line',
      'list',
      'listen',
      'little',
      'live',
      'local',
      'long',
      'look',
      'lose',
      'loss',
      'lot',
      'love',
      'low',
      'machine',
      'magazine',
      'main',
      'maintain',
      'major',
      'majority',
      'make',
      'man',
      'manage',
      'management',
      'manager',
      'many',
      'market',
      'marriage',
      'material',
      'matter',
      'may',
      'maybe',
      'me',
      'mean',
      'measure',
      'media',
      'medical',
      'meet',
      'meeting',
      'member',
      'memory',
      'mention',
      'message',
      'method',
      'middle',
      'might',
      'military',
      'million',
      'mind',
      'minute',
      'miss',
      'mission',
      'model',
      'modern',
      'moment',
      'money',
      'month',
      'more',
      'morning',
      'most',
      'mother',
      'mouth',
      'move',
      'movement',
      'movie',
      'Mr',
      'Mrs',
      'much',
      'music',
      'must',
      'my',
      'myself',
      'name',
      'nation',
      'national',
      'natural',
      'nature',
      'near',
      'nearly',
      'necessary',
      'need',
      'network',
      'never',
      'new',
      'news',
      'newspaper',
      'next',
      'nice',
      'night',
      'no',
      'none',
      'nor',
      'north',
      'not',
      'note',
      'nothing',
      'notice',
      'now',
      'n\'t',
      'number',
      'occur',
      'of',
      'off',
      'offer',
      'office',
      'officer',
      'official',
      'often',
      'oh',
      'oil',
      'ok',
      'old',
      'on',
      'once',
      'one',
      'only',
      'onto',
      'open',
      'operation',
      'opportunity',
      'option',
      'or',
      'order',
      'organization',
      'other',
      'others',
      'our',
      'out',
      'outside',
      'over',
      'own',
      'owner',
      'page',
      'pain',
      'painting',
      'paper',
      'parent',
      'part',
      'participant',
      'particular',
      'particularly',
      'partner',
      'party',
      'pass',
      'past',
      'patient',
      'pattern',
      'pay',
      'peace',
      'people',
      'per',
      'perform',
      'performance',
      'perhaps',
      'period',
      'person',
      'personal',
      'phone',
      'physical',
      'pick',
      'picture',
      'piece',
      'place',
      'plan',
      'plant',
      'play',
      'player',
      'PM',
      'point',
      'police',
      'policy',
      'political',
      'politics',
      'poor',
      'popular',
      'population',
      'position',
      'positive',
      'possible',
      'power',
      'practice',
      'prepare',
      'present',
      'president',
      'pressure',
      'pretty',
      'prevent',
      'price',
      'private',
      'probably',
      'problem',
      'process',
      'produce',
      'product',
      'production',
      'professional',
      'professor',
      'program',
      'project',
      'property',
      'protect',
      'prove',
      'provide',
      'public',
      'pull',
      'purpose',
      'push',
      'put',
      'quality',
      'question',
      'quickly',
      'quite',
      'race',
      'radio',
      'raise',
      'range',
      'rate',
      'rather',
      'reach',
      'read',
      'ready',
      'real',
      'reality',
      'realize',
      'really',
      'reason',
      'receive',
      'recent',
      'recently',
      'recognize',
      'record',
      'red',
      'reduce',
      'reflect',
      'region',
      'relate',
      'relationship',
      'religious',
      'remain',
      'remember',
      'remove',
      'report',
      'represent',
      'Republican',
      'require',
      'research',
      'resource',
      'respond',
      'response',
      'responsibility',
      'rest',
      'result',
      'return',
      'reveal',
      'rich',
      'right',
      'rise',
      'risk',
      'road',
      'rock',
      'role',
      'room',
      'rule',
      'run',
      'safe',
      'same',
      'save',
      'say',
      'scene',
      'school',
      'science',
      'scientist',
      'score',
      'sea',
      'season',
      'seat',
      'second',
      'section',
      'security',
      'see',
      'seek',
      'seem',
      'sell',
      'send',
      'senior',
      'sense',
      'series',
      'serious',
      'serve',
      'service',
      'set',
      'seven',
      'several',
      'sex',
      'sexual',
      'shake',
      'share',
      'she',
      'shoot',
      'short',
      'shot',
      'should',
      'shoulder',
      'show',
      'side',
      'sign',
      'significant',
      'similar',
      'simple',
      'simply',
      'since',
      'sing',
      'single',
      'sister',
      'sit',
      'site',
      'situation',
      'six',
      'size',
      'skill',
      'skin',
      'small',
      'smile',
      'so',
      'social',
      'society',
      'soldier',
      'some',
      'somebody',
      'someone',
      'something',
      'sometimes',
      'son',
      'song',
      'soon',
      'sort',
      'sound',
      'source',
      'south',
      'southern',
      'space',
      'speak',
      'special',
      'specific',
      'speech',
      'spend',
      'sport',
      'spring',
      'staff',
      'stage',
      'stand',
      'standard',
      'star',
      'start',
      'state',
      'statement',
      'station',
      'stay',
      'step',
      'still',
      'stock',
      'stop',
      'store',
      'story',
      'strategy',
      'street',
      'strong',
      'structure',
      'student',
      'study',
      'stuff',
      'style',
      'subject',
      'success',
      'successful',
      'such',
      'suddenly',
      'suffer',
      'suggest',
      'summer',
      'support',
      'sure',
      'surface',
      'system',
      'table',
      'take',
      'talk',
      'task',
      'tax',
      'teach',
      'teacher',
      'team',
      'technology',
      'television',
      'tell',
      'ten',
      'tend',
      'term',
      'test',
      'than',
      'thank',
      'that',
      'the',
      'their',
      'them',
      'themselves',
      'then',
      'theory',
      'there',
      'these',
      'they',
      'thing',
      'think',
      'third',
      'this',
      'those',
      'though',
      'thought',
      'thousand',
      'threat',
      'three',
      'through',
      'throughout',
      'throw',
      'thus',
      'time',
      'to',
      'today',
      'together',
      'tonight',
      'too',
      'top',
      'total',
      'tough',
      'toward',
      'town',
      'trade',
      'traditional',
      'training',
      'travel',
      'treat',
      'treatment',
      'tree',
      'trial',
      'trip',
      'trouble',
      'true',
      'truth',
      'try',
      'turn',
      'TV',
      'two',
      'type',
      'under',
      'understand',
      'unit',
      'until',
      'up',
      'upon',
      'us',
      'use',
      'usually',
      'value',
      'various',
      'very',
      'victim',
      'view',
      'violence',
      'visit',
      'voice',
      'vote',
      'wait',
      'walk',
      'wall',
      'want',
      'war',
      'watch',
      'water',
      'way',
      'we',
      'weapon',
      'wear',
      'week',
      'weight',
      'well',
      'west',
      'western',
      'what',
      'whatever',
      'when',
      'where',
      'whether',
      'which',
      'while',
      'white',
      'who',
      'whole',
      'whom',
      'whose',
      'why',
      'wide',
      'wife',
      'will',
      'win',
      'wind',
      'window',
      'wish',
      'with',
      'within',
      'without',
      'woman',
      'wonder',
      'word',
      'work',
      'worker',
      'world',
      'worry',
      'would',
      'write',
      'writer',
      'wrong',
      'yard',
      'yeah',
      'year',
      'yes',
      'yet',
      'you',
      'young',
      'your',
      'yourself'];

    $('.search').autocomplete({
      source: availableTags,
    });
  }

  //jQuery UI
  _dragAndDrop(){
    $('.parent-product, .buyBtn').draggable({
      revert: true
    });

    $('.header-flex').droppable({
      drop: (event, ui) => {
        if (ui.draggable.find('.buyBtn').length === 0) {
          this.addProduct(ui.draggable)
        } else {
          this.addProduct(ui.draggable.find('.buyBtn'))
        }
      }
    })
  }
}


