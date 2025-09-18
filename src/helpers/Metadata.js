import ComponentStore from 'src/helpers/componentStore';
import { Concept } from 'src/helpers/Concept';
import { DescriptorParser as Descriptor } from './descriptorParser';

export class Metadata {
  getMetadataForConcept(concept, idGenerator, type = 'obsGroupControl',
                        childType = 'obsControl', loc = { row: 0, column: 0 }, id) {
    let controls = undefined;
    if (concept.set) {
      let row = 0;
      controls = concept.setMembers.map(c => {
        if (c.set) {
          return this.getMetadataForConcept(c, idGenerator,
            type, undefined, { row: row++, column: loc.column });
        }
        return this.getMetadataForConcept(c, idGenerator,
          childType, undefined, { row: row++, column: loc.column });
      });
    }

    const properties = {
      location: loc,
    };
    const descriptor = new Descriptor(ComponentStore.getDesignerComponent(type));
    const metadata = descriptor.data().metadata;
    metadata.properties = Object.assign({}, metadata.properties, properties);

    const updatedMetadata = Object.assign({}, metadata,
      { id: id || String(idGenerator.getId()) },
      { concept },
      { controls },
      { label: Object.assign({}, metadata.label, { value: concept.name }) },
      { properties: Object.assign({}, metadata.properties, properties) });
    if (type === childType) {
      return Object.assign({}, updatedMetadata, new Concept(concept).getNumericContext());
    }
    return updatedMetadata;
  }

}
