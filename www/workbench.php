<?php
/****************************************************************************
 *  ./workbench.php
 *
 *  2008-10-05
 *  Copyright 2008 by Jan Renken, Hamburg
 *  Author: Jan Renken
 *  Email:  j-renken@foni.net
 ****************************************************************************/

/*
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Library General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */
	//Load the configuration initializer.
	require_once('../config/configuration.php');
	$config=new Configuration('../config/config.ini');
	
	//Read configuration data and set the constants.
	if($config->getError()>0)
		die('No configuration set!');
	
	foreach($config->getConfiguration() as $section=>$values)
	{
		foreach($values as $key=>$value)
		{
			define(strtoupper($section.'_'.$key),$value);
		}
	}
	
	//Include the main core classes
	require_once(PATH_FRAMEWORK.'/core/application.php');
	
	//Setup database
	$db=new Db(DB_HOST, DB_NAME, DB_USER, DB_PASSWORD);
	
	//Initialize admin
    $initData=array(
		'default'=>'/windows/data',
		'db'=>$db,
		'session'=>false,
		'components'=>array(
			'windows'=>array(
				'component'=>'Windows',
				'responseType'=>'json',
			),
			'file'=>array(
				'component'=>'File',
				'responseType'=>'file'
			),
			'guestbook'=>array(
				'component'=>'Guestbook',
				'responseType'=>'json',
				'template'=>"<b>%s schrieb %s:</b><br />%s<br /><br />"
			)
		)
	);
	
 	//Start and run the application
    $application=new Application($initData);
    $application->run();
?>
