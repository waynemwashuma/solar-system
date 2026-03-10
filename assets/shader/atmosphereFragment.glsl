uniform vec3 uCameraPosition;
uniform vec3 uLightDirection;
uniform vec3 uAtmosphereColor;
uniform vec3 uSunsetColor;
uniform float uIntensity;
uniform float uFalloff;
uniform float uSunBoost;
uniform float uEdgeSoftness;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
  vec3 lightDirection = normalize(uLightDirection);
  vec3 normal = normalize(vWorldNormal);

  float horizon = 1.0 - max(dot(normal, viewDirection), 0.0);
  float rim = pow(horizon, uFalloff);
  float lightScatter = pow(max(dot(normal, lightDirection), 0.0), uEdgeSoftness);
  float sunsetScatter = pow(max(dot(-normal, lightDirection), 0.0), 1.5);

  vec3 scatterColor = mix(uAtmosphereColor, uSunsetColor, sunsetScatter * 0.85);
  float alpha = rim * (0.35 + lightScatter * uSunBoost) * uIntensity;

  gl_FragColor = vec4(scatterColor * (rim + lightScatter * 0.45), alpha);
}
