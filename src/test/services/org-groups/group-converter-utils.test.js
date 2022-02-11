import {
  leaf,
  parent,
  root,
  convertToOrgGroup,
} from '../../../services/org-groups';

describe('Group Access', function () {
  it('should get correct leaf', async function () {
    expect(leaf('/role/parent/child')).toBe('child');
    expect(leaf('/role/parent')).toBe('parent');
    expect(leaf('/role')).toBe('role');
  });

  it('should get correct root', async function () {
    expect(root('/role/parent/child')).toBe('role');
    expect(root('/role/parent')).toBe('role');
    expect(root('/role')).toBe('');
  });

  it('should get correct parents', async function () {
    expect(parent('/role/parent/child')).toBe('/parent');
    expect(parent('/role/child')).toBe('');
    expect(parent('/role')).toBe('');
    expect(parent('/role/parent1/parent2/child')).toBe('/parent1/parent2');
  });

  it('should get correct orgGroup conversion 4 level', async function () {
    const og = convertToOrgGroup('/role/parent1/parent2/child');
    expect(og.name).toBe('child');
    expect(og.parent).toBe('/role/parent1/parent2');
  });

  it('should get correct orgGroup conversion 3 level', async function () {
    const og = convertToOrgGroup('/role/parent/child');
    expect(og.name).toBe('child');
    expect(og.parent).toBe('/role/parent');
  });

  it('should get correct orgGroup conversion 2 level', async function () {
    const og = convertToOrgGroup('/role/parent');
    expect(og.name).toBe('parent');
    expect(og.parent).toBe('/role');
  });

  it('should get correct orgGroup conversion 1 level', async function () {
    const og = convertToOrgGroup('/role');
    expect(og.name).toBe('role');
    expect(og.parent).toBe('');
  });
});
