<?php
/****************************************************************************
 *  ./components/window.php
 *
 *  2008-10-08
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
 	class Window
	{
		var $window;
		var $icons;
		var $children;
		var $content;
		
		function Window($node)
		{
			//Setup values
			$nodeValues=$node->getValue();
			$this->window=$nodeValues['window'];
			$this->icons=$nodeValues['icons'];
			if($nodeValues['content'])
				$this->content=$nodeValues['content'];
			
			//Setup children
			$children=$node->getChildNodes();
			if(!empty($children))
				$this->children=$this->_createChildren($node);
		}
		
		function _createChildren($node)
		{
			$windows=array();
			foreach($node->getChildNodes() as $child)
			{
				$windows[]=new Window($child);
			}
			return $windows;
		}
	}
?>
