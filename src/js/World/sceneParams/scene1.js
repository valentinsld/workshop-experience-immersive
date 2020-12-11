export default {
  meshes: [
    // standard three mesh
    {
      name: 'Square',
      geometry: {
        type: 'BoxGeometry',
        // params: {},
      },
      instances: [
        {
          texture: {
            type: 'MeshNormalMaterial',
            // params: {},
          },
          // position: {}
        },
      ],
    },
    // imported mesh
    {
      name: 'Suzanne2',
      animated: false,
      modelName: 'suzanne',
      instances: [
        {
          texture: {
            type: 'MeshNormalMaterial',
            params: {},
          },
          position: {}
        },
      ],
    },
  ],
  steps: [
    [
      {
        mesh: 'mesh1',
        position: {},
        duration: 200,
        waitBeforeNext: 200,
        additionalBehavior: () => null,
      },
    ],
  ],
}
