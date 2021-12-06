class Reviews {
    constructor(source, container = '#reviews') {
        this.source = source;
        this.container = container;
        this.reviewsItems = [];
        this._init();
    }

    _render() {
        let $wrapper = $('<div/>', {
            class: 'wrapper-author'
        });
        let $authorName = $('<p/>', {
            text: 'Name:'
        });
        let $authorNameText = $('<input/>', {
            class: 'author-name'
        });
        let $authorReview = $('<p/>', {
            text: 'Feedback:'
        });
        let $authorReviewText = $('<textarea/>', {
            class: 'author-text',
            cols: '30',
            rows: '10',
            id: '#'
        });
        let $authorReviewButton = $('<button/>', {
            class: 'author-review-button',
            text: 'Send feedback'
        });
        let $jsonReviews = $('<div/>', {
            class: 'json-reviews'
        });
        let $sendFeedback = $('<button/>', {
            class: 'send-feedback',
            text: 'Feedback'
        });

        $authorName.appendTo($wrapper);
        $authorNameText.appendTo($wrapper);
        $authorReview.appendTo($wrapper);
        $authorReviewText.appendTo($wrapper);
        $authorReviewButton.appendTo($wrapper);
        $(this.container).append($wrapper);
        $(this.container).append($jsonReviews);
        $($jsonReviews).append($sendFeedback);

        $($wrapper).hide();
        $sendFeedback.click(event => {
            $($wrapper).show().dialog({
                modal: true,
                title: 'You feedback'
            });
        })
    }

    _init() {
        this._render();
        if (!localStorage.getItem('reviews')) {
            fetch(this.source)
                .then(result => result.json())
                .then(data => {
                    for (let review of data) {
                        this.reviewsItems.push(review);
                        localStorage.setItem('reviews', JSON.stringify(this.reviewsItems));
                        this._displayReviews(review);
                    }
                });
        } else {
            this.reviewsItems = JSON.parse(localStorage.getItem('reviews'));
            for (let review of this.reviewsItems) {
                this._displayReviews(review);
            }
        }
        this._toSendReview();
    };

    _displayReviews(review) {
        let $container = $('<div/>', {
            class: 'review-container',
            id: review.id,
            'data-is-approved': review.isApproved
        });
        $container.append($(`<h3 class="review-author">${review.author}</h3>`));
        $container.append($(`<p class="review-text">${review.text}</p>`));
        let $approveButton = $(`<button class="approve-button">Approve</button>`);
        let $removeButton = $(`<button class="remove-button">Remove feedback</button>`)
        $approveButton.appendTo($container);
        $removeButton.appendTo($container);
        $container.appendTo('.json-reviews');
        this._toApprove($approveButton);
        this._toRemove($removeButton);
    }

    _toSendReview() {
        $('.wrapper-author').keyup(event => {
            $('.wrapper-error').remove();
        });
        $('.wrapper-author').on('click', '.author-review-button', event => {
            $('.wrapper-error').remove();
            if (($('.author-name').val().length > 2) &&
                ($('.author-text').val().length > 15)) {
                $('.wrapper-error').remove();
                let thisId = 0;
                this.reviewsItems.forEach(review => {
                    if (thisId <= review.id) {
                        thisId = review.id;
                        thisId++;
                    }
                });
                let $authorReview = {
                    author: $('.author-name').val(),
                    id: thisId,
                    isApproved: false,
                    text: $('.author-text').val(),
                };
                this.reviewsItems.push($authorReview);
                localStorage.setItem('reviews', JSON.stringify(this.reviewsItems));
                this._displayReviews($authorReview);
                $('.author-name').val('');
                $('.author-text').val('');
                $('.wrapper-author').append($(`<p class="wrapper-error">Отзыв успешно добавлен!</p>`));
                $('.wrapper-error').css('color', 'green');

                // $('.wrapper-author').bind("dialogclose");
            } else {
                $('.wrapper-author').append($(`<p class="wrapper-error">Имя должно быть не менее 3 символов, а отзыв не менее 15!</p>`))
            }
        });
    }

    _toApprove($approveButton) {
        $approveButton.click(event => {
            event.target.parentElement.dataset.isApproved = 'true';
            for (let review of this.reviewsItems) {
                if (+event.target.parentElement.id === +review.id) {
                    review.isApproved = 'true';
                }
            }
        })
    }

    _toRemove($removeButton) {
        $removeButton.click(event => {
            event.target.parentElement.remove();
            for (let review of this.reviewsItems) {
                if (+event.target.parentElement.id === +review.id) {
                    this.reviewsItems.splice(this.reviewsItems.indexOf(review), 1);
                }
            }
            localStorage.setItem('reviews', JSON.stringify(this.reviewsItems));
        })
    }
}
