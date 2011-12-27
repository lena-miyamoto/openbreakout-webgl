#!/usr/bin/env python3
import sys
import io

vertices = []
normals  = []
faces    = []
bbox     = [] # front-top-left, back-bottom-right

def parse_face(line):
	f = line.split(' ', 4)
	if len(f) < 4:
		print('Error: invalid normal vector!')
		return None
	else:
		coord  = None
		coords = []
		for elem in f[1:]:
			coord = elem.split('/')
			if len(coord) != 3:
				print('Error: invalid face coordinate (only triangles are supported)!')
				break
			elif len(coord[0]) == 0:
				print('Error: face coordinate has no vertex index!')
				break
			else:
				coords.append([
					(int(coord[0]) - 1),
					-1 if len(coord[1]) == 0 else (int(coord[1]) - 1),
					-1 if len(coord[2]) == 0 else (int(coord[2]) - 1)
				])
			
		return coords
#end parse_normal

def parse_normal(line):
	vn = line.split(' ', 4)
	if len(vn) < 4:
		print('Error: invalid normal vector!')
		return None
	else:
		return [
			float(vn[1]),
			float(vn[2]),
			float(vn[3]),
			float(vn[4]) if len(vn) == 5 else 0.0
		]
#end parse_normal
		
def parse_vertex(line):
	v = line.split(' ', 4)
	if len(v) < 4:
		print('Error: invalid normal vector!')
		return None
	else:
		return [
			float(v[1]),
			float(v[2]),
			float(v[3]),
			float(v[4]) if len(v) == 5 else 0.0
		]
#end parse_normal

def calculate_bounding_box():
	min_x = min_y = min_z = 0
	max_x = max_y = max_z = 0
	
	for v in vertices: # v = [0:x, 1:y, 2:z(, 3:w)]
		if v[0] < min_x:
			min_x = v[0]
		if v[0] > max_x:
			max_x = v[0]
		if v[1] < min_y:
			min_y = v[1]
		if v[1] > max_y:
			max_y = v[1]
		if v[2] < min_z:
			min_z = v[2]
		if v[2] > max_z:
			max_z = v[2]
	#end for
	
	bbox.append([min_x, max_y, max_z]) # front-top-left
	bbox.append([max_x, min_y, min_z]) # back-bottom-right
#end calculate_bounding_box()

def read_obj_file(path):
	vn = v = f = None;
	line = None;
	with io.open(path, 'r') as file:
		for line in file:
			line = line.rstrip();
		
			if line.startswith('#'):
				continue
			if line.startswith('f'):
				f = parse_face(line)
				if f != None:
					faces.append(f)
			elif line.startswith('vn'):
				vn = parse_normal(line)
				if vn != None:
					normals.append(vn)
			elif line.startswith('v'):
				v = parse_vertex(line)
				if v != None:
					vertices.append(v)
			else:
				print('// Unknown attribute \'' + line.split(' ', 1)[0] + '\'')
		#end for
	#end with (stream will be closed automatically after exiting the with clause)
#end read_obj_file

def print_json(os):
	itemSize = 3
	print(
		'var Cube = {\n',
		'\titemSize: ', itemSize, ',\n',
		'\tnumItems: ', (len(faces) * itemSize), ',\n',
		'\tbounds:   {\n\t\tftl: ', bbox[0], ',\n\t\tbbr: ', bbox[1], '\n\t},\n',
		'\tvertices: [',
		sep='', file=os
	)

	first = True
	for face in faces:
		for elem in face:
			if first:
				first = False
			else:
				print(',', file=os)
		
			print(
				'\t\t',
				vertices[elem[0]][0], ', ',
				vertices[elem[0]][1], ', ',
				#vertices[elem[0]][2], ', ',
				vertices[elem[0]][2],
				sep='', end='', file=os
			)
		#end for
	#end for
	print('\n\t],', file=os)

	print('\tnormals: [', file=os)
	first = True
	for face in faces:
		for elem in face:
			if first:
				first = False
			else:
				print(',', file=os)
		
			print(
				'\t\t',
				normals[elem[2]][0], ', ',
				normals[elem[2]][1], ', ',
				#normals[elem[2]][2], ', ',
				normals[elem[2]][2],
				sep='', end='', file=os
			)
		#end for
	#end for
	print('\n\t]\n};', file=os)
#end print_json

if len(sys.argv) != 3:
	print('Invalid amount of arguments! Usage: obj2json.py [obj-file] [output file]')
else:
	read_obj_file(sys.argv[1])
	calculate_bounding_box()
	with io.open(sys.argv[2], 'w') as file:
		print_json(file)

