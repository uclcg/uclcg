function setup()
{
	UI = {};
	UI.tabs = [];
	UI.titleLong = 'Ray Tracer';
	UI.titleShort = 'RT';

	UI.tabs.push(
		{
		visible: true,
		type: `x-shader/x-fragment`,
		title: `RaytracingDemoFS - GL`,
		id: `RaytracingDemoFS`,
		initialValue: `precision highp float;

struct PointLight {
    vec3 position;
    vec3 color;
};

struct Material {
    vec3  diffuse;
    vec3  specular;
    float glossiness;
};

struct Sphere
{
    vec3     position;
    float    radius;
    Material material;
};

const int lightCount = 2;
const int sphereCount = 2;

struct Scene
{
    PointLight[lightCount] lights;
    Sphere[sphereCount] spheres;
};

struct Ray
{
    vec3 origin;
    vec3 direction;
};

// contains all information pertaining to a ray/object intersection
struct HitInfo {
    bool     hit;
    float    t;
    vec3     position;
    vec3     normal;
    Material material;
};

HitInfo intersect_sphere(Ray ray,
                         Sphere sphere)
{
    vec3 to_sphere = sphere.position - ray.origin;

    float a = dot(ray.direction, ray.direction);
    float b = 2.0 * dot(to_sphere, ray.direction);
    float c = dot(to_sphere, to_sphere) - sphere.radius * sphere.radius;
    float D = b * b - 4.0 * a * c;
    if (D > 0.0)
    {
        float t = (-b - sqrt(D)) / (2.0 * a);
      	vec3 hitPosition = ray.origin + t * ray.direction;
        return HitInfo(
          	true,
          	t,
          	hitPosition,
          	normalize(hitPosition + sphere.position),
          	sphere.material);
    }
    return HitInfo(false, 0.0, vec3(0.0), vec3(0.0), Material(vec3(0.0), vec3(0.0), 0.0));
}

vec3 shade_from_light(const HitInfo    hit_info,
                      const PointLight light)
{
  	//return vec3(0.5) + 0.5 * hit_info.normal;
    vec3 delta = hit_info.position - light.position;

    float diffuse_term = max(0.0, dot(hit_info.normal, normalize(delta)));
    float specular_term  = pow(max(0.0, dot(normalize(delta), -reflect(hit_info.normal, normalize(hit_info.position)))), hit_info.material.glossiness);

    return light.color * (
      	specular_term * hit_info.material.specular +
      	diffuse_term * hit_info.material.diffuse);
}

vec3 shade_from_lights(const HitInfo       hit_info,
                       PointLight[2]       lights)
{
    vec3 shading = vec3(0);
    for (int i = 0; i < lightCount; ++i) {
        shading += shade_from_light(hit_info, lights[i]); 
    }
    return shading;
}

HitInfo intersect_scene(Scene scene, Ray ray)
{
    HitInfo best_hit_info;
    best_hit_info.t = 100000.0;

    for (int i = 0; i < sphereCount; ++i) {
        Sphere sphere = scene.spheres[i];
        HitInfo hit_info = intersect_sphere(ray, sphere);

        if (hit_info.hit && hit_info.t < best_hit_info.t) {
            best_hit_info = hit_info;
        }
    }

    return best_hit_info;
}

vec3 color_for_fragment(Scene scene, vec2 frag_coord)
{
    // setup ray
    vec3 origin = vec3(0.0, 0.0, 0.0);
    vec3 direction = vec3((vec2(2.0, -1.0) * (frag_coord / vec2(800, 400) - vec2(0.5))), 1);
    Ray ray = Ray(origin, direction);

    // intersect ray with scene
    HitInfo intersection = intersect_scene(scene, ray);

    // shade based on intersection
    return shade_from_lights(intersection, scene.lights);
}

void main()
{
    // setup scene
    Scene scene;

    // lights
    scene.lights[0].position = vec3(10, 20, 30);
    scene.lights[0].color    = 0.5 * vec3(1, 0.9, 0.8);

    scene.lights[1].position = vec3(-10, -4, 13);
    scene.lights[1].color    = 0.5 * vec3(0.9, 0.8, 1);

    // spheres
    scene.spheres[0].position            = vec3(2, -2, -12);
    scene.spheres[0].radius              = 3.0;

    scene.spheres[0].material.diffuse    = vec3(1, 0.8, 0.9);
    scene.spheres[0].material.specular   = vec3(1.0, 1.0, 1.0);
    scene.spheres[0].material.glossiness = 10.0;

    scene.spheres[1].position            = vec3(-2, 1, -8);
    scene.spheres[1].radius              = 3.0;

    scene.spheres[1].material.diffuse    = vec3(0.6, 0.8, 1.0);
    scene.spheres[1].material.specular   = vec3(1.0, 1.0, 1.0);
    scene.spheres[1].material.glossiness = 80.0;

    // compute color for fragment
    gl_FragColor.rgb = color_for_fragment(scene, gl_FragCoord.xy);
	gl_FragColor.a = 1.0;
}
`,
		description: ``,
		wrapFunctionStart: ``,
		wrapFunctionEnd: ``
	});

	UI.tabs.push(
		{
		visible: true,
		type: `x-shader/x-vertex`,
		title: `RaytracingDemoVS - GL`,
		id: `RaytracingDemoVS`,
		initialValue: `attribute vec3 position;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
  
    void main(void) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`,
		description: ``,
		wrapFunctionStart: ``,
		wrapFunctionEnd: ``
	});

	 return UI; 
}//!setup

var gl;
function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

    console.log(str);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function RaytracingDemo() {
}

RaytracingDemo.prototype.initShaders = function() {

	this.shaderProgram = gl.createProgram();

	gl.attachShader(this.shaderProgram, getShader(gl, "RaytracingDemoVS"));
	gl.attachShader(this.shaderProgram, getShader(gl, "RaytracingDemoFS"));
	gl.linkProgram(this.shaderProgram);

	if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(this.shaderProgram);

	this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "position");
	gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

	this.shaderProgram.projectionMatrixUniform = gl.getUniformLocation(this.shaderProgram, "projectionMatrix");
	this.shaderProgram.modelviewMatrixUniform = gl.getUniformLocation(this.shaderProgram, "modelViewMatrix");
}

RaytracingDemo.prototype.initBuffers = function() {
	this.triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);
	
	var vertices = [
		 -1,  -1,  0,
		 -1,  1,  0,
		 1,  1,  0,

		 -1,  -1,  0,
		 1,  -1,  0,
		 1,  1,  0,
	 ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.triangleVertexPositionBuffer.itemSize = 3;
	this.triangleVertexPositionBuffer.numItems = 3 * 2;
}

RaytracingDemo.prototype.drawScene = function() {
			
	var perspectiveMatrix = new J3DIMatrix4();	
	perspectiveMatrix.setUniform(gl, this.shaderProgram.projectionMatrixUniform, false);

	var modelViewMatrix = new J3DIMatrix4();	
	modelViewMatrix.setUniform(gl, this.shaderProgram.modelviewMatrixUniform, false);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, this.triangleVertexPositionBuffer.numItems);
}

RaytracingDemo.prototype.run = function() {
	this.initShaders();
	this.initBuffers();

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);

	this.drawScene();
};

function init() {	
	initGL(document.getElementById("glViewport"));

	env = new RaytracingDemo();	
	env.run();

    return env;
}

function compute(canvas)
{
    env.initShaders();
    env.initBuffers();

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    env.drawScene();
}