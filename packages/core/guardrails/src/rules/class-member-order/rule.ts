import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { classMemberOrderErrors } from './errors';
import type { ClassMemberOrderRuleOptions, ClassMemberPhase, ClassRuleInput } from './types';

/**
 * Enforces configured class member ordering and constructor count.
 */
export class Rule extends Guardrail<ClassMemberOrderRuleOptions> {
  public readonly name = 'class-member-order';

  /**
   * Checks non-test TypeScript files that define class declarations.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if (input.file.endsWith('.test.ts')) {
        return;
      }

      this.checkFile(input);
    });
  }

  private checkFile(input: ClassRuleInput) {
    for (const classDeclaration of input.sourceFile.statements.filter(ts.isClassDeclaration)) {
      this.checkClass(classDeclaration, input.reporter);
    }
  }

  private checkClass(classDeclaration: ts.ClassDeclaration, reporter: Reporter) {
    let currentPhase: ClassMemberPhase =
      (this.options.memberOrder ?? ['fields', 'constructor', 'accessors', 'methods'])[0] ?? 'fields';
    let constructorCount = 0;

    for (const member of classDeclaration.members) {
      const nextPhase = this.getMemberPhase(member);
      if (nextPhase === 'constructor') {
        constructorCount++;
      }

      if (
        !this.isValidPhaseTransition(currentPhase, nextPhase) ||
        constructorCount > (this.options.maxConstructors ?? 1)
      ) {
        this.fail(reporter);
      }

      currentPhase = this.laterPhase(currentPhase, nextPhase);
    }
  }

  private isValidPhaseTransition(current: ClassMemberPhase, next: ClassMemberPhase) {
    return this.phaseRank(next) >= this.phaseRank(current);
  }

  private laterPhase(current: ClassMemberPhase, next: ClassMemberPhase) {
    return this.phaseRank(next) > this.phaseRank(current) ? next : current;
  }

  private getMemberPhase(member: ts.ClassElement): ClassMemberPhase {
    if (ts.isPropertyDeclaration(member)) {
      return 'fields';
    }
    if (ts.isConstructorDeclaration(member)) {
      return 'constructor';
    }
    if (ts.isGetAccessorDeclaration(member) || ts.isSetAccessorDeclaration(member)) {
      return 'accessors';
    }
    return 'methods';
  }

  private phaseRank(phase: ClassMemberPhase) {
    return (this.options.memberOrder ?? ['fields', 'constructor', 'accessors', 'methods']).indexOf(phase);
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'class-member-order', ...classMemberOrderErrors['class-member-order'] });
  }
}
