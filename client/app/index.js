define([
	'jquery',
    'jqueryUI',
	'underscore',
	'Backbone',
    'bootstrap',
    'src/views/ClusteredBubbleChartStoryView',
	'src/views/MetricsStoryView',
	'src/views/IndexedDBTableView',
    'text!src/templates/boardLevel.html',
	'atmosphere'
], function ($, jqueryUI, _, Backbone, bootstrap, ClusteredBubbleChartStoryView, MetricsStoryView, IndexedDBTableView, boardLevelTpl, atmosphere) {
	'use strict';

	var BoardLevelView = Backbone.View.extend({
        events: {
            'click .addCard': 'addRecordToIndexedDB',
            'click .deleteCard': 'deleteRecordFromIndexedDB',
			'click .closeModal': 'closeModal',
		},

        template: _.template(boardLevelTpl),

		initialize: function (config) {
            var xAxisFieldValues = this.getXAxisFieldValues(config.cards);

            this.render(config.cards, xAxisFieldValues, config.switchLevel);

			this.subscribe();
		},

        isWithinDays: function (date, no_of_days) {
            let milli = Date.parse(date);
            let referenceDate = Date.parse(new Date("2019-06-18"));

            let diff = referenceDate - milli;

            let minutes = Math.floor(diff / 60000);
            let hours = Math.round(minutes / 60);
            let days = Math.round(hours / 24);

            return days <= no_of_days
        },

        getXAxisFieldValues: function (cards) {
            let cardsPerSwim = {};

            cards.forEach((card) => {
                  // if (this.isWithinDays(card.card_start_date, 7) || this.isWithinDays(card.card_end_date, 7)) {
                      if (cardsPerSwim[card.present_swim_name]) {
                          cardsPerSwim[card.present_swim_name] = cardsPerSwim[card.present_swim_name] + 1;
                      } else {
                          cardsPerSwim[card.present_swim_name] = 1;
                      }
                  // }
              });

              let seriesData = [], sortable = [], xAxisFieldValues = [];

              for (var swimName in cardsPerSwim) {
                  if (cardsPerSwim.hasOwnProperty(swimName)) {
                      sortable.push([swimName, cardsPerSwim[swimName]]);
                  }
              }

              sortable.sort(function(a, b) {
                  return b[1] - a[1];
              });

              // sortable = sortable.slice(0,3);

              for (var i = 0; i < sortable.length; i++) {
                  seriesData.push({
                     L1:  sortable[i][1],
                     size: sortable[i][1],
                     color: 'blue'
                 });

                 xAxisFieldValues.push(sortable[i][0]);
              }

              return xAxisFieldValues;
        },

		render: function (cards, xAxisFieldValues, switchLevel) {
            this.$el.html(this.template());

            this.clusteredBubbleChartStoryView = new ClusteredBubbleChartStoryView({cards: cards, xAxisFieldValues: xAxisFieldValues, editCard: this.editCard.bind(this), switchLevel: switchLevel});

			this.metricsStoryView = new MetricsStoryView({cards: cards, xAxisFieldValues: xAxisFieldValues,
				editCard: this.editCard.bind(this), refreshCBChart: this.clusteredBubbleChartStoryView.refreshChart.bind(this.clusteredBubbleChartStoryView)});

			this.indexedDBTableView = new IndexedDBTableView({cards: cards});

            this.$el.append(this.clusteredBubbleChartStoryView.el);
			this.$el.append(this.metricsStoryView.el);
			this.$el.append(this.indexedDBTableView.el);
		},

		addCardToClusteredBubbleChart: function (card) {
			this.clusteredBubbleChartStoryView.addCard(card);
		},

		editCardToClusteredBubbleChart: function (card) {
			this.clusteredBubbleChartStoryView.editCardCB(card);
		},

        addRecordToIndexedDB: function (card) {
            var me = this;

            $('.modal-backdrop').hide();

            if ($('button.addCard').hasClass('edit')) {
                me.editCardInIndexedDB();

                return false;
            }

			var cardID, swimname;
			if (typeof card.card_id === 'undefined') {
				cardID = $('.addCardPopup input#cardID').val();
				swimname = $('.addCardPopup #swimName').val();

				if (cardID.length === 0) {
	                alert('Please enter Card ID')

	                return false;
	            }

				if (swimname.length === 0) {
					alert('Please enter Swim Name');

	                return false;
				}
			}
            var DBOpenRequest = window.indexedDB.open("MyTestDatabase");

            var row = typeof card.card_id !== 'undefined' ? card : {
                "card_id": cardID,
                "card_type":  $('.addCardPopup #cardType').find(":selected").val(),
                "work_type": "TSK",
                "number_of_queues": 2,
                "max_queue_duration": 0.00003472222222222222,
                "min_queue_duration": 0.00003472222222222222,
                "mean_queue_duration": 0.00003472222222222222,
                "waittime": "",
                "leadtime": "",
                "cycletime": "",
                "WORKTIME": "",
                "blockedtime": "",
                "present_swim_name": swimname,
                "Is_Current": "Y",
                "IS_RELATED": false,
                "CLASS_OF_SERVICE": "Standard Class",
                "SUMMARY_TYPE": "leaf",
                "CARD_SIZE": "M",
                "base_project_id": 1600595,
                "card_start_date": "2019-12-20T20:01:28.000+05:30",
                "card_end_date": "",
                "flow_efficiency": "",
                "number_of_todos": "",
                "mean_planned_effort": "",
                "number_of_owners": "",
                "number_of_comments": "",
                "number_of_employees": 0
            }

            DBOpenRequest.onsuccess = function (event) {
                // store the result of opening the database in the db variable.
                // This is used a lot below
                var db = DBOpenRequest.result;

                // Run the getData() function to get the data from the database
                var transaction = db.transaction(["cards"], "readwrite");

                var objectStore = transaction.objectStore("cards");

                var objectStoreRequest = objectStore.add(row);

                objectStoreRequest.onsuccess = function(event) {
                    // me.getDataFromIndexedDB();

					me.addCardToClusteredBubbleChart(row);

                }

                objectStoreRequest.onerror = function(event) {

                }
            }
        },

        getDataFromIndexedDB: function () {
            var me = this;

            var DBOpenRequest = window.indexedDB.open("MyTestDatabase");

            DBOpenRequest.onsuccess = function (event) {
                // store the result of opening the database in the db variable.
                // This is used a lot below
                var db = DBOpenRequest.result;

                // Run the getData() function to get the data from the database
                var transaction = db.transaction(["cards"], "readwrite");

                var objectStore = transaction.objectStore("cards");

                var objectStoreRequest = objectStore.getAll();

                objectStoreRequest.onsuccess = function(event) {
                    // report the success of our request
                    var data = objectStoreRequest.result;

                    // data = data.filter(function (row) {
                    //     return (me.isWithinDays(row.card_start_date, me.no_of_days) || me.isWithinDays(row.card_end_date, me.no_of_days))
                    // });

                    me.$el.empty();

                    me.render(data, me.getXAxisFieldValues(data));
                }
            }
        },

        editCard: function (card) {
            var me = this;
            this.currentEditedCard = card;

            $('.openAddCard').click();
            $('#myModal .modal-title').text('Edit Card');
            $('.addCardPopup input#cardID').val(card.card_id);
            $('.addCardPopup input#cardID').prop('disabled', true);
            $('button.addCard').addClass('edit');
            $('button.deleteCard').removeClass('hide');
        },

        editCardInIndexedDB: function () {
            var me = this;
            $('button.addCard').removeClass('edit');

            this.currentEditedCard['card_type'] = $('.addCardPopup #cardType').find(":selected").val();
            this.currentEditedCard['present_swim_name'] = $('.addCardPopup #swimName').val();

            var DBOpenRequest = window.indexedDB.open("MyTestDatabase");

            DBOpenRequest.onsuccess = function (event) {
                // store the result of opening the database in the db variable.
                // This is used a lot below
                var db = DBOpenRequest.result;

                // Run the getData() function to get the data from the database
                var transaction = db.transaction(["cards"], "readwrite");

                var objectStore = transaction.objectStore("cards");

                var objectStoreRequest = objectStore.put(me.currentEditedCard);

                objectStoreRequest.onsuccess = function(event) {
					$('#myModal .modal-title').text('Add Card');
                    $('button.deleteCard').addClass('hide');
                    $('.addCardPopup input#cardID').prop('disabled', false);
					$('.addCardPopup input#cardID').val('');
					$('.addCardPopup input#swimName').val('');

					me.editCardToClusteredBubbleChart(me.currentEditedCard);

                    me.currentEditedCard = undefined;

                    // me.getDataFromIndexedDB();
                }

                objectStoreRequest.onerror = function(event) {

                }
            }
        },

        deleteRecordFromIndexedDB: function () {
            var me = this;
            $('button.editCard').removeClass('edit');

            $('.modal-backdrop').hide();

            var DBOpenRequest = window.indexedDB.open("MyTestDatabase");

            DBOpenRequest.onsuccess = function (event) {
                // store the result of opening the database in the db variable.
                // This is used a lot below
                var db = DBOpenRequest.result;

                // Run the getData() function to get the data from the database
                var transaction = db.transaction(["cards"], "readwrite");

                var objectStore = transaction.objectStore("cards");

                var objectStoreRequest = objectStore.delete(me.currentEditedCard.card_id);

                objectStoreRequest.onsuccess = function(event) {
                    me.currentEditedCard = undefined;

                    $('#myModal .modal-title').text('Add Card');
                    $('button.deleteCard').addClass('hide');
                    $('.addCardPopup input#cardID').prop('disabled', false);
					$('.addCardPopup input#cardID').val('');
					$('.addCardPopup input#swimName').val('');

                    me.getDataFromIndexedDB();
                }

                objectStoreRequest.onerror = function(event) {

                }
            }
        },

		closeModal: function () {
			$('#myModal .modal-title').text('Add Card');
			$('button.deleteCard').addClass('hide');
			$('.addCardPopup input#cardID').prop('disabled', false);
			$('.addCardPopup input#cardID').val('');
			$('.addCardPopup input#swimName').val('');
		},

		subscribe: function () {
			var me = this;

            var request = {
                url : 'http://192.168.100.104:8089/push/analytics/cards_data/1554947',
			};

            request.onMessage = function (response) {

                if (response.status == 200) {
                    var data = JSON.parse(response.responseBody);

					me.addRecordToIndexedDB(data);
                }
            };

			var socket = atmosphere;

            var subSocket = socket.subscribe(request);
	    }

	});

	return BoardLevelView;
});
