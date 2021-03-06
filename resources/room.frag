uniform vec3 eyePos;
uniform vec3 roomDim;
uniform float numLights;
uniform float invNumLights;
uniform float invNumLightsHalf;
uniform sampler2D lightsTex;
uniform float att;
uniform float mainPower;

varying vec3 eyeDir;
varying vec4 vVertex;
varying vec3 vNormal;

// http://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation/
vec3 PointLight( vec3 vertex, vec3 normal, vec3 eyeDirN, vec3 lightCenter, float lightRadius, vec3 color, float cutoff )
{
    vec3 lightDir	= lightCenter - vertex;
    float distance	= length( lightDir );
	distance *= distance;
    float d			= max( distance - lightRadius, 0.0 );
    lightDir		/= distance;
    vec3 HV			= normalize( normalize( lightDir ) + eyeDirN );
	
    // calculate basic attenuation
//    float denom = d/lightRadius + 1.0;
	float denom = d + 1.0;
    float attenuation = 1.0 / ( denom*denom );
    
    // scale and bias attenuation such that:
    //   attenuation == 0 at extent of max influence
    //   attenuation == 1 when d == 0
    attenuation		= ( attenuation - cutoff ) / ( 1.0 - cutoff );
    attenuation		= max( attenuation, 0.0 );
    
    float diff		= max( dot( lightDir, normal ), 0.0 );
//	float NdotHV	= max( dot( normal, HV ), 0.0 );
//	float spec		= pow( normalize( NdotHV ), 30.0 );
    return color * diff * 0.025 * attenuation;
}


void main()
{
	vec3 starLighting		= vec3( 0.0 );
	float index = invNumLightsHalf;
	for( float i=0.0; i<numLights; i+=1.0 ){
		vec3 pos		= texture2D( lightsTex, vec2( index, 0.25 ) ).rgb;
		vec3 color		= texture2D( lightsTex, vec2( index, 0.75 ) ).rgb;
		float radius	= 1.0;
		starLighting	+= PointLight( vVertex.xyz, vNormal, eyeDir, pos, radius, color, att );
		index			+= invNumLights;
	}

	
//	float ao = 1.0 - length( vVertex.xyz ) * 0.0008;
//	ao *= pow( clamp( ( ao - 0.3 ) * 2.0, 0.0, 1.0 ), 1.0 );

	
	float aoLight = 1.0 - length( vVertex.xyz ) * 0.0035;
	float aoDark  = aoLight;
	
	vec3 litRoomColor	= vec3( aoLight );
	vec3 darkRoomColor	= vec3( aoDark + starLighting );
	
	gl_FragColor.rgb	= mix( litRoomColor, darkRoomColor, mainPower );
	gl_FragColor.a		= 1.0;
}