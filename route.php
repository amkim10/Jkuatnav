<?php
include('config.inc.php');



   // Retrieve start point
   $start = split(' ',$_REQUEST['startpoint']);
   $startPoint = array($start[0], $start[1]);

   // Retrieve end point
   $end = split(' ',$_REQUEST['finalpoint']);
   $endPoint = array($end[0], $end[1]);

$sql = "
SELECT 
  *, ST_AsGeoJSON(the_geom) as geojson, ST_Length(the_geom) as length 
FROM 
  sp_smart_directed(
    '".TABLE."', 
    true, 
    ".$startPoint[0].", 
    ".$startPoint[1].", 
    ".$endPoint[0].", 
    ".$endPoint[1].", 
    1000, 
    'cost', 
    'cost', 
    false, 
    false
  );";


   // Connect to database
   $dbcon = pg_connect("dbname=".PG_DB." host=".PG_HOST." user=".PG_USER." password=".PG_PASSWORD);

   // Perform database query
   $query = pg_query($dbcon,$sql); 
   



   // Return route as GeoJSON
   $geojson = array(
      'type'      => 'FeatureCollection',
      'features'  => array()
   ); 
  
   // Add edges to GeoJSON array
   while($edge=pg_fetch_assoc($query)) {  

      $feature = array(
         'type' => 'Feature',
         'geometry' => json_decode($edge['geojson'], true),
         'crs' => array(
            'type' => 'EPSG',
            'properties' => array('code' => PROJ)
         ),
         'properties' => array(
            'id' => $edge['id'],
            'length' => $edge['length']
         )
      );
      
      // Add feature array to feature collection array
      array_push($geojson['features'], $feature);
   }

	
   // Close database connection
   pg_close($dbcon);

   // Return routing result
   header('Content-type: application/json',true);
   echo json_encode($geojson);
   

?>
