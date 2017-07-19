/*
	Grabs calendar events using Eventbrite API
	(C) Benjamin Gwynn Design, 2017 (benjamin@gwynn.design)
*/

(function initCapitalCal ($) {
	"use strict"

	// do nothing if this is not the Upcoming Events page.
	if (jQuery(".content h1").text() !== "Upcoming Events") return

	// remove link to all events
	$(".content .allevents-link").remove()

	var ORGANISERS = ["11039589950", "14298913619"],
		N_ORGANISERS = ORGANISERS.length,
		OAUTH_TOKEN = "Y74BUZSTL7H6QEI4BB72",
		MAX_STRING_LEN = 512,

		$main = $(".eventbrite-cal"),
		$template = $main.find(".template"),
		
		nOrganisersFinished = 0

	$main.addClass("loading")

	function shortenString (string) {
		if (string.length > MAX_STRING_LEN) {
			return string.substr(0, MAX_STRING_LEN).trim() + "..."
		} else {
			return string
		}
	}

	function genFromTemplateWithData (object) {
		var $new = $template.clone()
		$new.removeClass("template")

		for (var key in object) {
			var $modify = $new.find("[data-key=\"" + key + "\"]"),
				as = $modify.data("as")

			if ($modify.length < 1) {
				throw new Error("Key '" + key + "' not found in your template.")
			}

			if (as) {
				$modify.attr(as, object[key])
			} else {
				$modify.html(object[key])
			}
		}

		$new.appendTo($main)
	}

	function prettyDate (date) {
		function format (num) {
			return (num / 10).toFixed(1).replace(".", "")
		}

		var dd = format(date.getDate()),
			mm = format(date.getMonth() + 1),
			yyyy = date.getFullYear(),
			HH = format(date.getHours()),
			MM = format(date.getMinutes()),
			output = dd + "/" + mm + "/" + yyyy + " " + HH + ":" + MM

		return output
	}

	function getEventsFromOrganiser (organiser, callback) {
		jQuery.get("https://www.eventbriteapi.com/v3/events/search/?token=" + OAUTH_TOKEN + "&organizer.id=" + organiser + "&sort_by=date", function getCallback (parsed) {
			callback(parsed.events)
		})
	}

	for (oragniserIndex = 0; oragniserIndex < N_ORGANISERS; oragniserIndex += 1) {
		var organiser = ORGANISERS[oragniserIndex]

		getEventsFromOrganiser(organiser, function (events) {
			// add each event to the dom
			for (var eventIndex = 0, nEvents = events.length; eventIndex < nEvents; eventIndex += 1) {
				var event = events[eventIndex]
				console.log(event)

				genFromTemplateWithData({
					"heading": event.name.text,
					"paragraph": shortenString(event.description.text),
					"url": event.url,
					"date": prettyDate(new Date(event.start.utc)),
					"free": event.is_free,
					"image": "background-image: url(" + event.logo.url + ")",
				})
			}

			// this counter is used for checking if evreything is finished
			nOrganisersFinished += 1

			if (nOrganisersFinished === N_ORGANISERS) {
				// if everything is finished don't load
				$main.removeClass("loading")
			}
		})
	}
}(window.jQuery))
