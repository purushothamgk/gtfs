var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');


// trip_id: '5672611',
//      route_id: '12',
//      direction_id: null,
//      start_time: '05:24:00',
//      start_date: '20170912',
//      schedule_relationship: null },
//   vehicle: { id: '2866', label: '199', license_plate: null },
//   stop_time_update
//console.log(label, trip_id, stopId , ata , convertEpochToGMT(eta.time.low), new Date())
console.log("Label,Trip,StopId,ETA,ScheduledTime(CST),CurrentTime(CST)" )
setInterval(estimate, 60000);
//estimate();

function estimate(){

    var requestSettings = {
        method: 'GET',
        url: 'feedUrl',
        encoding: null
    };
request(requestSettings, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
    feed.entity.forEach(function(entity) {
      if (entity.trip_update) {

        //TRIP 
        var trip = entity.trip_update.trip;
        var trip_id = trip.trip_id;
        var route_id = trip.route_id;
        var label = entity.trip_update.vehicle.label;
        var stops = entity.trip_update.stop_time_update;
        evaluate(stops, trip_id,route_id, label )
          
    
      }
    });
  }
});

}

function convertGMT_To_Zone(utcDate, zoneHour){
    utcDate.setHours(utcDate.getHours()-zoneHour);
    return new Date(utcDate);
}

function evaluate(stops, trip_id, route_id, label){

    //var recentStop = convertEpochToGMT(stops[0].departure.time.low)
   // var delay = Math.floor(Math.abs((recentStop - new Date())/(1000 * 60)))
    for(i=0; i < stops.length; i++ ){
        
        var s = stops[i]
       // if(s.stop_id == stopId){
            var eta = s.arrival ? s.arrival : s.departure;
            var ata = Math.floor((convertEpochToGMT(eta.time.low) - (new Date()))/(1000 * 60))

            if(ata >= 0)
                console.log(label,",",trip_id,",",s.stop_id,",",ata,",",convertGMT_To_Zone(convertEpochToGMT(eta.time.low),5),",",convertGMT_To_Zone(new Date(), 5))
            //console.log(stopId , " : ATA  is " , Math.floor((convertEpochToGMT(eta.time.low) - (new Date()))/(1000 * 60)))
            //console.log(stopId , " : ETA  is " , ((convertEpochToGMT(eta.time.low) - recentStop)/(1000 * 60)) + delay)
       // } 
    }

}

function convertEpochToGMT(epoch){
    var d = new Date(0);
    d.setUTCSeconds(epoch);
    return d;
}

function printStops(stops){
    for(i =0; i < stops.length; i++ ){
        var recent = stops[i];
        if (recent.departure){
                var dTime = convertEpochToGMT(recent.departure.time.low)
                console.log("Stop Sequence : " , recent.stop_sequence, "Stop ID : " , recent.stop_id, "Departure Time : " , dTime );
        }
        if (recent.arrival){
                var aTime = convertEpochToGMT(recent.arrival.time.low)
                console.log("Stop Sequence : " , recent.stop_sequence, "Stop ID : " , recent.stop_id, "Arrival Time : " , aTime);
        }
    }
}